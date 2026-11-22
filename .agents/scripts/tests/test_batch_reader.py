import hashlib
import json
from pathlib import Path
import re
import runpy
import subprocess
import sys
import tempfile
import unicodedata
import unittest
from unittest.mock import patch as mock_patch


RENDERER = Path(__file__).resolve().parents[1] / "review-packet.py"


def digest(patch):
    return hashlib.sha256(patch).hexdigest()


def notes(patch, files, decisions=()):
    return {"patch_sha256": digest(patch), "files": files, "project_decisions": list(decisions)}


class BatchReaderTest(unittest.TestCase):
    def setUp(self):
        scratch = tempfile.TemporaryDirectory()
        self.addCleanup(scratch.cleanup)
        self.root = Path(scratch.name).resolve()

    def write(self, name, value):
        path = self.root / name
        path.write_bytes(value if isinstance(value, bytes) else json.dumps(value).encode())
        return path

    def run_packet(self, patch, full_notes, *options, batch=True, ok=True):
        if batch and "--mode" not in options:
            options = ("--mode", "inspection", "--inspection-reason", "One reviewer is absent.", *options)
        if batch:
            options = ("--batch", "11", *options)
        result = subprocess.run(
            [sys.executable, "-B", RENDERER, *options, self.write("full.patch", patch),
             self.write("full.json", full_notes)], capture_output=True,
        )
        if ok:
            self.assertEqual(result.returncode, 0, result.stderr.decode())
            return result.stdout
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, b"")
        return result.stderr.decode()

    def test_five_phase_replacements_resume_at_measure_inclusively(self):
        phases = ("ASSESS", "PLAN", "MEASURE", "CHANGE", "VERIFY")
        patch = ("--- a/guide\n+++ b/guide\n@@ -1,7 +1,7 @@\n intro\n" + "".join(
            f"-{phase} old\n+{phase} local\n" for phase in phases
        ) + " outro\n").encode()
        annotation = {"guide": {"@1,1": "Compare these phase instructions.", **{
            f"-{line}/+{line}": f"Explain {phase} wording."
            for line, phase in enumerate(phases, 2)
        }}}
        bound = notes(patch, annotation, ({"before": "Original phase advice.", "after": "Local advice.",
                                          "judge": "Whether to use it here."},))
        full = self.run_packet(patch, bound).decode()
        resumed = self.run_packet(patch, bound, "--checkpoint", "F3").decode()
        self.assertTrue(full.startswith(f"# Full Batch 11 patch\n\n**INSPECTION · {digest(patch)[:12]}**\n"))
        label = re.compile(r"\*\*([FR][0-9]+) · ([+-][0-9]+):\*\*")
        self.assertEqual(label.findall(full), [(f"F{i}", f"{side}{i + 1}") for i in range(1, 6) for side in "-+"])
        self.assertEqual(label.findall(resumed), label.findall(full)[4:])
        for reader in (full, resumed):
            self.assertLess(reader.index("## Project-specific decisions"), reader.index("**Before:**"))
            self.assertLess(reader.index("**Before:**"), reader.index("**Draft:**"))
            self.assertLess(reader.index("**Draft:**"), reader.index("**Judgement:**"))
            self.assertIn("\nEnd of first decision.\n", reader)
            self.assertIn(digest(patch), reader)
            self.assert_raw_source(reader, "Full", self.root / "full.patch")
            self.assertRegex(reader, r"\*\*F3 · -4:\*\* Explain MEASURE wording\.\n\n```diff\n-MEASURE old")
            self.assertLess(reader.index("-MEASURE old"), reader.index("+MEASURE local"))
            self.assertIn("outro", reader)
        self.assertIn("intro", full)
        from_start = self.run_packet(patch, bound, "--checkpoint", "F1").decode()
        self.assertIn("intro", from_start)
        self.assertEqual(label.findall(from_start), label.findall(full))
        self.assertIn("First unread: F3", resumed)
        self.assertIn("resumed view is filtered", resumed)
        self.assertNotIn("-PLAN old", resumed)
        self.assertNotIn("Explain PLAN wording.", resumed)
        self.assertIn("no acceptance is requested or recorded", resumed)
        self.assertIn("unknown checkpoint", self.run_packet(patch, bound, "--checkpoint", "F6", ok=False))

    def test_declared_unequal_group_and_standalone_sides_preserve_every_reason(self):
        patch = (b"--- a/rules\n+++ b/rules\n@@ -1,4 +1,4 @@\n"
                 b"-first old\n-second old\n-third old\n+first new\n+second new\n+third new\n context\n")
        bound = notes(patch, {"rules": {
            "@1,1": "Hunk context.",
            "+3": "Independent addition last.",
            "+1": "Independent addition first.",
            "-2": "Independent removal.",
            "-3/+2/-1": {"-1": "One clause folded in.", "-3": "Another clause folded in.",
                         "+2": "Combined clause added."},
        }})
        rendered = self.run_packet(patch, bound).decode()
        expected = ("F1 · -1", "-first old", "F1 · -3", "-third old", "F1 · +2", "+second new",
                    "F2 · -2", "-second old", "F3 · +1", "+first new", "F4 · +3", "+third new", "context\n")
        offsets = [rendered.index(text) for text in expected]
        self.assertEqual(offsets, sorted(offsets))
        for reason in ("One clause folded in.", "Another clause folded in.", "Combined clause added.",
                       "Independent addition first.", "Independent addition last.", "Independent removal."):
            self.assertEqual(rendered.count(reason), 1)
        self.assertIn("No project-specific decisions were recorded for this patch.", rendered)
        # Filtering must not hide invalid notes for earlier, reviewed groups.
        del bound["files"]["rules"]["-2"]
        self.assertIn("missing rationale for -2", self.run_packet(patch, bound, "--checkpoint", "F3", ok=False))

    def test_retry_is_independently_bound_and_resumable_without_changing_full_gate(self):
        full = b"--- /dev/null\n+++ b/content\n@@ -0,0 +1 @@\n+full addition\n"
        extra = b"--- a/content\n+++ b/content\n@@ -1 +1 @@\n-full addition\n+retry amendment\n"
        bound = notes(full, {"content": {"@0,1": "Initial hunk.", "+1": "Initial note."}})
        retry_notes = {"patch_sha256": digest(extra), "files": {
            "content": {"@1,1": "Adjustment hunk.", "-1/+1": "Explain this adjustment."},
        }}
        retry_flags = ("--retry-patch", self.write("retry.patch", extra),
                       "--retry-notes", self.write("retry.json", retry_notes))
        reports = []
        for stage, verdict in (("instruction", "PASS"), ("project", "APPROVE")):
            reports += [f"--{stage}-report", self.write(stage, {
                "patch_sha256": digest(full), "verdict": verdict, "summary": "Reviewed the full patch.", "findings": [],
            })]
        first = self.run_packet(full, bound, "--mode", "acceptance", *reports, *retry_flags).decode()
        later = self.run_packet(full, bound, "--mode", "acceptance", *reports, *retry_flags,
                                "--checkpoint", "R1").decode()
        self.assertLess(first.index("F1 · +1"), first.index("R1 · -1"))
        self.assertIn("Full Batch 11 patch", later)
        self.assertIn("First unread: R1", later)
        self.assertIn("exact full batch draft", later)
        self.assertIn("R1 · -1", later)
        self.assertIn("R1 · +1", later)
        self.assertNotIn("F1 · +1", later)
        self.assert_raw_source(later, "Retry", self.root / "retry.patch")
        self.assertIn(digest(full), later)
        self.assertIn(digest(extra), later)
        error = self.run_packet(full, bound, "--checkpoint", "R1", ok=False)
        self.assertIn("unknown checkpoint", error)
        error = self.run_packet(full, bound, *retry_flags[:2], ok=False)
        self.assertIn("require each other", error)
        retry_notes["patch_sha256"] = digest(full)
        self.write("retry.json", retry_notes)
        self.assertIn("retry notes", self.run_packet(full, bound, *retry_flags, ok=False))
        self.assertIn("requires --instruction-report", self.run_packet(full, bound, "--mode", "acceptance", ok=False))

    def test_standalone_reports_real_absolute_input_paths(self):
        patch = b"--- /dev/null\n+++ b/doc\n@@ -0,0 +1 @@\n+draft\n"
        retry = b"--- a/doc\n+++ b/doc\n@@ -1 +1 @@\n-draft\n+revision\n"
        full_path = self.write("資料" * 25 + "  [label]```name\u202e.patch", patch)
        retry_path = self.write("second attempt.patch", retry)
        self.write("full.json", notes(patch, {"doc": {"@0,1": "Full hunk.", "+1": "Draft line."}}))
        self.write("retry.json", {"patch_sha256": digest(retry), "files": {
            "doc": {"@1,1": "Retry hunk.", "-1/+1": "Edited line."},
        }})
        view = self.render_from(self.root, full_path.name, "full.json", retry_path.name, "retry.json")
        self.assert_raw_source(view, "Full", str(full_path).replace("\u202e", r"\u202e"))
        self.assert_raw_source(view, "Retry", retry_path)
        self.assertNotIn("beside this view", view)
        self.assertNotIn("\u202e", view)
        self.assert_capped(view)

    def test_cli_does_not_infer_packet_layout_from_input_names(self):
        source, _, _ = self.packet_inputs("incoming")
        view = self.render_from(source, "FULL.patch", "NOTES.json", "RETRY.patch", "RETRY-NOTES.json")
        displayed = self.write("elsewhere.md", view.encode()).read_text(encoding="utf-8")
        self.assert_raw_source(displayed, "Full", source / "FULL.patch")
        self.assert_raw_source(displayed, "Retry", source / "RETRY.patch")
        self.assertNotIn("beside this view", displayed)

    def test_frozen_sources_remain_beside_the_view_after_rename(self):
        staged, patch, retry = self.packet_inputs("staged")
        view = self.render_frozen(staged)
        self.write("staged/PACKET.md", view.encode())
        frozen = staged.rename(self.root / "packet")
        displayed = (frozen / "PACKET.md").read_text(encoding="utf-8")
        self.assertEqual(displayed, self.render_frozen(frozen))
        self.assertNotIn(str(staged), displayed)
        for label, raw in (("Full", patch), ("Retry", retry)):
            reference = re.search(rf"\*\*{label} raw artifact \(beside this view\):\*\* `([^`]+)`", displayed)
            self.assertIsNotNone(reference)
            self.assertEqual((frozen / reference[1]).read_bytes(), raw)

    def packet_inputs(self, name):
        patch = b"--- /dev/null\n+++ b/doc\n@@ -0,0 +1 @@\n+draft\n"
        retry = b"--- a/doc\n+++ b/doc\n@@ -1 +1 @@\n-draft\n+revision\n"
        directory = self.root / name
        directory.mkdir()
        self.write(Path(name) / "FULL.patch", patch)
        self.write(Path(name) / "RETRY.patch", retry)
        self.write(Path(name) / "NOTES.json", notes(patch, {"doc": {"@0,1": "Full hunk.", "+1": "Draft line."}}))
        self.write(Path(name) / "RETRY-NOTES.json", {"patch_sha256": digest(retry), "files": {
            "doc": {"@1,1": "Retry hunk.", "-1/+1": "Edited line."},
        }})
        return directory, patch, retry

    def render_frozen(self, directory):
        full, retry = Path("FULL.patch"), Path("RETRY.patch")
        with mock_patch.object(sys, "path", [str(RENDERER.parent), *sys.path]):
            renderer = runpy.run_path(str(RENDERER))["render"]
            return renderer(
                (directory / full).read_bytes(), json.loads((directory / "NOTES.json").read_bytes()),
                batch=11, mode="inspection", inspection_reason="Review supplied inputs.",
                retry_patch=(directory / retry).read_bytes(),
                retry_notes=json.loads((directory / "RETRY-NOTES.json").read_bytes()),
                _sources=(full, retry),
            ).decode()

    def render_from(self, directory, full, full_notes, retry, retry_notes):
        result = subprocess.run(
            [sys.executable, "-B", RENDERER, "--batch", "11", "--mode", "inspection",
             "--inspection-reason", "Review supplied inputs.", "--retry-patch", retry,
             "--retry-notes", retry_notes, full, full_notes], cwd=directory, capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        return result.stdout.decode()

    def assert_raw_source(self, view, label, expected):
        match = re.search(rf"\*\*{label} raw input \(absolute path\):\*\*\n\n```text\n(.*?)\n```\n", view, re.S)
        self.assertIsNotNone(match)
        self.assertEqual("".join(line.removeprefix("↳ ") for line in match[1].splitlines()), str(expected))

    def test_width_fences_file_boundaries_and_no_newline_markers(self):
        path = "資料" * 55 + "/a`[t]<b>.md"
        patch = (f"--- a/{path}\r\n+++ b/{path}\r\n@@ -1,3 +1,3 @@\r\n"
                 " ```\r\n-\r\n+\t\r\n-old tail\r\n\\ No newline at end of file\r\n"
                 "+" + "界" * 95 + "`" * 100 + "\r\n\\ No newline at end of file\r\n"
                 "--- a/empty\r\n+++ /dev/null\r\n@@ -1 +0,0 @@\r\n-\r\n"
                 "--- /dev/null\r\n+++ b/blank\r\n@@ -0,0 +1 @@\r\n+\r\n").encode()
        bound = notes(patch, {path: {"@1,1": "Show the original and local values.", "-2/+2": "Blank space differs.",
                                     "-3/+3": "Replace the final line."},
                              "empty": {"@1,0": "Remove the file.", "-1": "Remove a blank line."},
                              "blank": {"@0,1": "Add the file.", "+1": "Add a blank line."}})
        rendered = self.run_packet(patch, bound).decode()
        self.assertIn(digest(patch), rendered)
        self.assertNotIn("\r", rendered)
        self.assertNotIn("\t", rendered)
        self.assertIn("⇥", rendered)
        self.assertIn("↳", rendered)
        self.assertEqual(rendered.count("界"), 95)
        self.assertEqual(rendered.count(r"\ No newline at end of file"), 2)
        self.assertIn("--- a/empty", rendered)
        self.assertIn("+++ /dev/null", rendered)
        self.assertEqual(rendered.count("\n-\n"), 2)
        self.assertIn("+++ b/blank", rendered)
        self.assertEqual(rendered.count("\n+\n"), 1)
        self.assertIn("\n ```\n", patch.decode().replace("\r\n", "\n"))
        self.assertNotIn("\n ```\n", rendered)
        self.assertLess(rendered.index("F1 · -2"), rendered.index("F1 · +2"))
        self.assert_capped(rendered)

    def test_changed_lines_fit_annotate_even_for_exceptionally_wide_signs(self):
        # Widths in Annotate's unicode-width, not Python's East Asian Width.
        for char, cells in (("\u17d8", 3), ("\u17a4", 2)):
            with self.subTest(char=char):
                value = "a" * 75 + char + "X"
                patch = f"--- /dev/null\n+++ b/doc\n@@ -0,0 +1 @@\n+{value}\n".encode()
                bound = notes(patch, {"doc": {"@0,1": "New line.", "+1": "Check the ending."}})
                view = self.run_packet(patch, bound).decode()
                rows = view.split("**F1 · +1:** Check the ending.\n\n```diff\n", 1)[1].split("```", 1)[0].splitlines()
                joined = rows[0][1:] + "".join(row.removeprefix("+↳ ") for row in rows[1:])
                self.assertEqual(joined.replace(fr"\u{ord(char):04x}", char), value)
                for row in rows:
                    self.assertLessEqual(2 + len(row) + row.count(char) * (cells - 1), 80, row)

    def test_prose_is_literal_and_report_findings_are_complete(self):
        patch = b"--- /dev/null\n+++ b/content\n@@ -0,0 +1 @@\n+value\n"
        long_text = "文" * 100
        suspicious = "[click](https://example.invalid) <b>x</b> # Full Batch 11 patch\nEnd of first decision."
        bound = notes(patch, {"content": {"@0,1": "Hunk.", "+1": "Line note."}}, (
            {"before": suspicious + " " + long_text, "after": "Local description.", "judge": "Is it needed?"},
        ))
        report = self.write("negative.json", {"patch_sha256": digest(patch), "verdict": "REVISE",
            "summary": "Longword" * 20 + " summary end.", "findings": [
                {"location": suspicious.replace("\n", " "), "consequence": long_text + " first finding end."},
                {"location": "Another location.", "consequence": "Second finding end."},
            ]})
        rendered = self.run_packet(patch, bound, "--instruction-report", report).decode()
        self.assert_capped(rendered)
        self.assertIn("Instruction review (REVISE)", rendered)
        self.assertEqual(rendered.count("文"), 200)
        joined = rendered.replace("  \n↳ ␠", " ").replace("  \n↳ ", "")
        self.assertIn("summary end", joined)
        self.assertIn("first finding end", joined)
        self.assertIn("Second finding end", joined)
        self.assertNotIn("[click](https:", rendered)
        self.assertNotIn("<b>", rendered)
        self.assertEqual(rendered.splitlines().count("End of first decision."), 1)

    def test_accepted_unicode_controls_cannot_change_display_order(self):
        path = "name\u202e.md"
        patch = f"--- /dev/null\n+++ b/{path}\n@@ -0,0 +1 @@\n+before\u202eafter\n".encode()
        bound = notes(patch, {path: {"@0,1": "Hunk.", "+1": "Same\u2067 clause."}})
        rendered = self.run_packet(patch, bound).decode()
        self.assertNotIn("\u202e", rendered)
        self.assertNotIn("\u2067", rendered)
        self.assertIn(r"+++ b/name\u202e.md", rendered)
        self.assertIn(r"+before\u202eafter", rendered)
        self.assertIn(r"Same\\u2067 clause.", rendered)

    def test_literal_markers_and_escape_spellings_remain_distinct(self):
        patch = ("--- a/doc\n+++ b/doc\n@@ -1,3 +1,3 @@\n"
                 "-\t\n+⇥\n-\u202e\n+\\u202e\n-↳\n+\\↳\n").encode()
        bound = notes(patch, {"doc": {"@1,1": "Distinguish source characters.",
                                     **{f"-{i}/+{i}": "Compare literal bytes." for i in (1, 2, 3)}}})
        view = self.run_packet(patch, bound).decode()
        for row in ("-⇥", "+\\⇥", r"-\u202e", r"+\\u202e", r"-\↳", r"+\\\↳"):
            self.assertIn("\n" + row + "\n", view)

    def test_trailing_spaces_are_visible_and_accents_stay_with_the_base(self):
        old = "a" * 76 + "e\u0301"
        patch = ("--- a/doc\n+++ b/doc\n@@ -1,2 +1,2 @@\n"
                 + "-" + old + "\n+" + old + "  \n-␠\n+ \n").encode()
        bound = notes(patch, {"doc": {"@1,1": "Hard break.", "-1/+1": "Trailing spaces.",
                                     "-2/+2": "Literal versus encoded space."}})
        view = self.run_packet(patch, bound).decode()
        self.assertIn("\n-↳ e\u0301\n", view)
        self.assertIn("\n+↳ e\u0301␠␠\n", view)
        self.assertIn("\n-\\␠\n", view)
        self.assertIn("\n+␠\n", view)
        self.assert_capped(view)

    def test_word_boundary_and_wrapped_token_differ(self):
        patch = b"--- /dev/null\n+++ b/doc\n@@ -0,0 +1 @@\n+text\n"
        left = "a" * 64
        values = [left + "b", left + " b"]
        views = [self.run_packet(patch, notes(patch, {"doc": {"@0,1": "Hunk.", "+1": "Reason."}},
                    [{"before": value, "after": "Local.", "judge": "Review this name."}])).decode()
                 for value in values]
        paragraphs = [v.split("**Before:** ", 1)[1].split("\n\n", 1)[0] for v in views]
        self.assertNotEqual(*paragraphs)
        self.assertEqual([v.replace("  \n↳ ␠", " ").replace("  \n↳ ", "") for v in paragraphs], values)

    def test_filename_and_decision_distinguish_trailing_nonbreaking_space(self):
        name = "doc\u00a0"
        patch = f"--- /dev/null\n+++ b/{name}\n@@ -0,0 +1 @@\n+text\n".encode()
        data = notes(patch, {name: {"@0,1": "Hunk.", "+1": "Reason."}},
                     [{"before": name, "after": "doc", "judge": "Which file?"}])
        view = self.run_packet(patch, data).decode()
        self.assertIn(r"**File:** doc\\u00a0", view)
        self.assertIn(r"**Before:** doc\\u00a0", view)
        self.assertIn("**Draft:** doc\n", view)
        self.assertIn(r"+++ b/doc\u00a0", view)

    def test_internal_spaces_in_decisions_and_spaces_stranded_at_wrap(self):
        stem = "a" * 75
        patch = ("--- a/a  b.md\n+++ b/a  b.md\n@@ -1 +1 @@\n"
                 f"-{stem} 界\n+{stem}  界\n").encode()
        bound = notes(patch, {"a  b.md": {"@1,1": "Whitespace changes.", "-1/+1": "Review the spaces."}},
                      [{"before": "a  b.md", "after": "a b.md", "judge": "Which filename?"}])
        view = self.run_packet(patch, bound).decode()
        self.assertIn("**File:** a␠␠b.md", view)
        self.assertIn("**Before:** a␠␠b.md", view)
        self.assertIn("**Draft:** a b.md", view)
        self.assertIn(f"-{stem}␠\n-↳ 界", view)
        self.assertIn(f"+{stem}␠␠\n+↳ 界", view)
        self.assert_capped(view)

    def test_checkpoint_in_second_hunk_reprints_file_boundary(self):
        patch = (b"--- a/doc\n+++ b/doc\n@@ -1 +1 @@\n-old intro\n+new intro\n"
                 b"@@ -20,2 +20,2 @@ detail\n unchanged intro\n-old detail\n+new detail\n")
        bound = notes(patch, {"doc": {"@1,1": "First hunk.", "-1/+1": "Intro edit.",
                                     "@20,20": "Second hunk.", "-21/+21": "Detail edit."}})
        rendered = self.run_packet(patch, bound, "--checkpoint", "F2").decode()
        self.assertIn("--- a/doc\n+++ b/doc\n", rendered)
        self.assertNotIn("First hunk.", rendered)
        self.assertIn("Second hunk.", rendered)
        self.assertIn("unchanged intro", rendered)
        self.assertIn("F2 · -21", rendered)

    def test_duplicate_json_keys_and_negative_acceptance_are_rejected(self):
        patch = b"--- /dev/null\n+++ b/doc\n@@ -0,0 +1 @@\n+added\n"
        bound = notes(patch, {"doc": {"@0,1": "Hunk.", "+1": "New line."}})
        repeating = json.dumps(bound).replace('"New line."', '"New line.", "+1": "Duplicate."').encode()
        self.assertIn("duplicate JSON key '+1'", self.run_packet(patch, repeating, ok=False))
        negative = self.write("negative.json", {
            "patch_sha256": digest(patch), "verdict": "REVISE", "summary": "Needs changes.",
            "findings": [{"location": "doc", "consequence": "Clarify intent."}],
        })
        positive = self.write("positive.json", {
            "patch_sha256": digest(patch), "verdict": "APPROVE", "summary": "No findings.", "findings": [],
        })
        error = self.run_packet(patch, bound, "--mode", "acceptance", "--instruction-report", negative,
                                "--project-report", positive, ok=False)
        self.assertIn("instruction report must have verdict PASS", error)

    def test_rejects_overlapping_or_incomplete_group_reasons_and_malformed_patch(self):
        patch = b"--- a/doc\n+++ b/doc\n@@ -1 +1 @@\n-old\n+new\n"
        for addresses, error in (
            ({"-1/+1": "Replace.", "+1": "Duplicate."}, "duplicate rationale"),
            ({"-1/-1/+1": "Replace."}, "invalid replacement group"),
            ({"-1/+1": {"-1": "Remove only."}}, "exactly one reason per group member"),
            ({"-1/+2": "Unknown member."}, "invalid replacement group"),
        ):
            with self.subTest(addresses=addresses):
                bound = notes(patch, {"doc": {"@1,1": "Hunk.", **addresses}})
                self.assertIn(error, self.run_packet(patch, bound, ok=False))
        malformed = patch[:-1]
        bound = notes(malformed, {"doc": {"@1,1": "Hunk.", "-1/+1": "Replace."}})
        self.assertIn("expected UTF-8 text patch", self.run_packet(malformed, bound, ok=False))

    def test_generic_output_is_byte_exact_and_new_flags_require_a_batch(self):
        patch = b"--- a/doc\r\n+++ b/doc\r\n@@ -1 +1 @@\r\n-old\r\n+new\r\n"
        bound = {"patch_sha256": digest(patch), "decision": "Review proposed change.", "review": "QA separately.",
                 "files": {"doc": {"@1,1": "Hunk note.", "-1/+1": "Line note."}}}
        expected = (
            "# Review packet\n\n**Decision:** Review proposed change.\n\n**Separate project review:** QA separately.\n\n"
            "**Review gate:** Patch identity and rationale coverage checked. This packet does not replace "
            "independent project review or grant local acceptance.\n\n"
            f"**Patch SHA-256:** `{digest(patch)}`\n\n## ` doc `\n\n### `@1,1`\n\nHunk note.\n\n```diff\n"
        ).encode() + patch + b"```\n\n- `-1/+1`: Line note.\n\n"
        self.assertEqual(self.run_packet(patch, bound, batch=False), expected)
        self.assertIn("require --batch", self.run_packet(patch, bound, "--checkpoint", "F1", batch=False, ok=False))

    def assert_capped(self, rendered):
        for line in rendered.splitlines():
            width = sum(2 if unicodedata.east_asian_width(char) in "WF" else 1 for char in line)
            self.assertLessEqual(width + 2, 80, repr(line))


if __name__ == "__main__":
    unittest.main()
