"""Render an exact unified text patch and its rationale.

Generic notes JSON has patch_sha256 (hex), decision (prose), review (a
reference to separate project review of these bytes) and files (path to
rationale map). With --batch, full notes instead have patch_sha256, files
and project_decisions (a list of before/after/judge objects). Retry notes
have only patch_sha256 and files and must match the separate retry bytes.

Use paths without a/ or b/, @OLDSTART,NEWSTART for hunks and -N or +N for
changed lines. A single -N/+M reason may cover both changes in one hunk.
In numbered packets, declare related sides in a slash-separated group,
e.g. "-1/-2/+1", with a shared reason string or an object with one reason
per member. Standalone addresses are independent. Every changed side
and hunk needs a reason, even when hidden by a first-unread checkpoint.

The patch must be UTF-8 with LF-terminated records (CRLF also accepted).
Use bare ---/+++ headers with unquoted paths or /dev/null. Git metadata,
renames, timestamps, binary changes and terminal control characters are not
supported. The numbered CLI shows absolute paths to the raw inputs.
Use those inputs for byte-exact source, not the wrapped display.
Generic packets embed the exact diff in their Markdown source.
"""

import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import sys


HUNK = re.compile(r"@@ -([0-9]+)(?:,([0-9]+))? \+([0-9]+)(?:,([0-9]+))? @@(?: .*)?")
UNSAFE_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")
NO_NEWLINE = r"\ No newline at end of file"
SIDES = {"-": (0,), "+": (1,), " ": (0, 1)}


def header_path(line, prefix, number):
    if line == prefix[:4] + "/dev/null":
        return None
    if not line.startswith(prefix) or len(line) == len(prefix) or "\t" in line:
        raise ValueError(f"patch line {number}: expected {prefix}PATH or /dev/null")
    return line[len(prefix):]


def parse_hunk(lines, index, match, previous, ended, *, numbered):
    old, old_count, new, new_count = match.groups()
    starts = [int(old), int(new)]
    counts = [int(old_count or "1"), int(new_count or "1")]
    # These offsets count lines before each range. An empty range is after
    # its start, whereas a non-empty range includes its start.
    offsets = [start - bool(count) for start, count in zip(starts, counts)]
    limits = [offset + count for offset, count in zip(offsets, counts)]
    for side, offset in enumerate(offsets):
        if offset < previous[side] or (side in ended and limits[side] != previous[side]):
            raise ValueError(f"patch line {index + 1}: invalid or out-of-order hunk range")

    key = f"@{starts[0]},{starts[1]}"
    changed = []
    rows = [] if numbered else None
    index += 1
    while offsets != limits:
        if index == len(lines):
            raise ValueError(f"hunk {key}: incomplete body")
        row = lines[index]
        prefix = row[:1]
        sides = SIDES.get(prefix)
        if not sides or any(side in ended or offsets[side] == limits[side] for side in sides):
            raise ValueError(f"patch line {index + 1}: unexpected hunk line")
        address = None
        for side in sides:
            offsets[side] += 1
            if prefix != " ":
                address = f"{prefix}{offsets[side]}"
                changed.append(address)
        index += 1
        marker = index < len(lines) and lines[index] == NO_NEWLINE
        if marker:
            ended.update(sides)
            index += 1
        if rows is not None:
            rows.append((address, row, marker))
    if not changed:
        raise ValueError(f"hunk {key}: no changed lines")
    return index, key, limits, changed, rows


def parse_patch(text, *, numbered=False):
    if not text.endswith("\n") or UNSAFE_CONTROL.search(text) or re.search(r"\r(?!\n)", text):
        raise ValueError("expected UTF-8 text patch with LF or CRLF records and no control characters")
    records = text[:-1].split("\n")
    lines = [record.removesuffix("\r") for record in records]
    files = {}
    index = 0
    while index < len(lines):
        old = header_path(lines[index], "--- a/", index + 1)
        if index + 1 == len(lines):
            raise ValueError("missing +++ file header")
        new = header_path(lines[index + 1], "+++ b/", index + 2)
        path = new or old
        if not path or (old and new and old != new) or path in files:
            raise ValueError(f"patch line {index + 1}: unsupported or duplicate file headers")
        headers = tuple(lines[index:index + 2]) if numbered else None
        index += 2
        hunks = {}
        previous = [0, 0]
        ended = {side for side, name in enumerate((old, new)) if name is None}
        while index < len(lines) and lines[index].startswith("@@"):
            match = HUNK.fullmatch(lines[index])
            if not match:
                raise ValueError(f"patch line {index + 1}: invalid hunk header")
            start = index if hunks else index - 2  # Include both file headers with the first hunk.
            header = lines[index]
            index, key, previous, changed, rows = parse_hunk(
                lines, index, match, previous, ended, numbered=numbered,
            )
            if numbered:
                hunks[key] = changed, header, rows
            else:
                fragment = "\n".join(records[start:index]) + "\n"
                hunks[key] = changed, fragment
        if not hunks:
            raise ValueError(f"{path!r}: expected at least one text hunk")
        files[path] = (headers, hunks) if numbered else hunks
    return files


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def prose(value, address):
    if not isinstance(value, str) or not value.strip() or UNSAFE_CONTROL.search(value):
        raise ValueError(f"{address}: expected nonblank text without control characters")
    text = html.escape(" ".join(value.split()), quote=False)
    text = re.sub(r"[\\`*_\[\]~]", lambda match: "\\" + match[0], text)
    return text


def backticks(text, minimum=1):
    return "`" * max(minimum, 1 + max((len(run) for run in re.findall(r"`+", text)), default=0))


def path_span(path):
    ticks = backticks(path)
    return f"{ticks} {path} {ticks}"


def file_sections(path, hunks, notes):
    if not isinstance(notes, dict):
        raise ValueError(f"{path!r}: expected an object mapping addresses to reasons")
    positions = {line: hunk for hunk, (changed, _) in hunks.items() for line in changed}
    hunk_reasons = {}
    line_reasons = {}
    for key, value in notes.items():
        reason = prose(value, f"{path!r} {key!r}")
        if key in hunks:
            hunk_reasons[key] = reason
            continue
        if key in positions:
            members = (key,)
        else:
            old, _, new = key.partition("/")
            if (not old.startswith("-") or not new.startswith("+")
                or old not in positions or positions[old] != positions.get(new)):
                raise ValueError(f"{path!r}: unknown address or invalid replacement pair {key!r}")
            members = (old, new)
        for line in members:
            if line in line_reasons:
                raise ValueError(f"{path!r}: duplicate rationale for {line}")
            line_reasons[line] = (key, reason)

    yield f"## {path_span(path)}\n\n"
    for hunk, (changed, fragment) in hunks.items():
        if hunk not in hunk_reasons:
            raise ValueError(f"{path!r}: missing rationale for {hunk}")
        yield f"### `{hunk}`\n\n{hunk_reasons[hunk]}\n\n"
        fence = backticks(fragment, minimum=3)
        yield f"{fence}diff\n{fragment}{fence}\n\n"
        printed = set()
        for line in changed:
            if line not in line_reasons:
                raise ValueError(f"{path!r}: missing rationale for {line}")
            key, reason = line_reasons[line]
            if key not in printed:
                yield f"- `{key}`: {reason}\n"
                printed.add(key)
        yield "\n"


def bind_notes(patch, notes, keys, expected_notes):
    if not isinstance(notes, dict) or notes.keys() != keys:
        raise ValueError(f"expected exactly {expected_notes} in notes JSON")
    digest = hashlib.sha256(patch).hexdigest()
    if not isinstance(notes["patch_sha256"], str) or notes["patch_sha256"].lower() != digest:
        raise ValueError(f"patch_sha256 does not match the patch bytes (SHA-256: {digest})")
    return digest


def file_notes(files, reasons):
    if not isinstance(reasons, dict):
        raise ValueError("files must be an object mapping paths to rationale")
    if missing := files.keys() - reasons.keys():
        raise ValueError(f"missing rationale for file {min(missing)!r}")
    if extra := reasons.keys() - files.keys():
        raise ValueError(f"unexpected rationale for file {min(extra)!r}")
    return reasons


def render(patch, notes, *, batch=None, mode=None, instruction_report=None,
           project_report=None, inspection_reason=None, retry_patch=None, retry_notes=None, checkpoint=None,
           _sources=(None, None)):
    """Render patch bytes; only the packet producer supplies packet-local sources."""
    if batch is None:
        if any(value is not None for value in (mode, instruction_report, project_report, inspection_reason)):
            raise ValueError("--mode, report flags and --inspection-reason require --batch")
        if any(value is not None for value in (retry_patch, retry_notes, checkpoint)):
            raise ValueError("--retry-patch, --retry-notes and --checkpoint require --batch")
        keys = {"patch_sha256", "decision", "review", "files"}
        expected_notes = "patch_sha256, decision, review and files"
    else:
        if batch < 1:
            raise ValueError("--batch must be a positive integer")
        if mode == "acceptance":
            if inspection_reason is not None:
                raise ValueError("--inspection-reason is not allowed in acceptance mode")
            if instruction_report is None or project_report is None:
                raise ValueError("acceptance mode requires --instruction-report and --project-report")
        elif mode == "inspection":
            if inspection_reason is None or not inspection_reason.strip():
                raise ValueError("inspection mode requires a nonblank --inspection-reason")
        else:
            raise ValueError("--batch requires --mode acceptance or inspection")
        keys = {"patch_sha256", "files", "project_decisions"}
        expected_notes = "patch_sha256, files and project_decisions"
        if (retry_patch is None) != (retry_notes is None):
            raise ValueError("--retry-patch and --retry-notes require each other")
    digest = bind_notes(patch, notes, keys, expected_notes)
    if batch is None:
        decision = prose(notes["decision"], "decision")
        review = prose(notes["review"], "review")
    files = parse_patch(patch.decode("utf-8"), numbered=batch is not None)
    reasons = file_notes(files, notes["files"])

    if batch is None:
        sections = [
            "# Review packet\n\n",
            f"**Decision:** {decision}\n\n",
            f"**Separate project review:** {review}\n\n",
            "**Review gate:** Patch identity and rationale coverage checked. "
            "This packet does not replace independent project review or grant local acceptance.\n\n",
        ]
    else:
        from batch_reader import batch_sections, numbered_files

        full = numbered_files(files, reasons)
        retry = None
        if retry_patch is not None:
            try:
                retry_digest = bind_notes(retry_patch, retry_notes, {"patch_sha256", "files"},
                                          "patch_sha256 and files")
                retry_files = parse_patch(retry_patch.decode("utf-8"), numbered=True)
                retry_reasons = file_notes(retry_files, retry_notes["files"])
                retry = (retry_digest, *numbered_files(retry_files, retry_reasons))
            except ValueError as error:
                raise ValueError(f"retry notes or patch: {error}") from None
        return "".join(batch_sections(
            batch, mode, digest, full, retry, notes["project_decisions"], checkpoint, inspection_reason,
            instruction_report, project_report,
            sources=_sources,
        )).encode("utf-8")
    sections.append(f"**Patch SHA-256:** `{digest}`\n\n")
    for path, hunks in files.items():
        sections.extend(file_sections(path, hunks, reasons[path]))
    return "".join(sections).encode("utf-8")


class _Once(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        if getattr(namespace, self.dest) is not None:
            parser.error(f"{option_string} may only be supplied once")
        setattr(namespace, self.dest, values)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter,
                                     allow_abbrev=False)
    parser.add_argument("patch", type=Path, metavar="PATCH")
    parser.add_argument("notes", type=Path, metavar="NOTES_JSON")
    parser.add_argument(
        "--batch", type=int, metavar="N", action=_Once,
        help="label a full batch patch; requires an explicit --mode",
    )
    parser.add_argument("--mode", choices=("acceptance", "inspection"), action=_Once)
    parser.add_argument("--instruction-report", type=Path, metavar="FILE", action=_Once)
    parser.add_argument("--project-report", type=Path, metavar="FILE", action=_Once)
    parser.add_argument("--inspection-reason", metavar="TEXT", action=_Once)
    parser.add_argument("--retry-patch", type=Path, metavar="PATCH", action=_Once,
                        help="annotated retry delta displayed after the full patch; requires --retry-notes")
    parser.add_argument("--retry-notes", type=Path, metavar="JSON", action=_Once,
                        help="retry notes bound to the retry bytes; requires --retry-patch")
    parser.add_argument("--checkpoint", metavar="GROUP", action=_Once,
                        help="resume inclusively at a group ID from these exact inputs (F1, F2, ... "
                             "for full; R1, R2, ... for retry)")
    args = parser.parse_args()
    if (args.retry_patch is None) != (args.retry_notes is None):
        parser.error("--retry-patch and --retry-notes require each other")
    if args.batch is None and (args.retry_patch is not None or args.checkpoint is not None):
        parser.error("--retry-patch, --retry-notes and --checkpoint require --batch")
    try:
        patch = args.patch.read_bytes()
        notes = json.loads(args.notes.read_text(encoding="utf-8"), object_pairs_hook=unique_object)
        retry_patch = retry_notes = None
        if args.retry_patch is not None:
            retry_patch = args.retry_patch.read_bytes()
            retry_notes = json.loads(args.retry_notes.read_text(encoding="utf-8"), object_pairs_hook=unique_object)
            if not isinstance(retry_notes, dict):
                raise ValueError("retry notes: expected a JSON object")
        sources = (None, None)
        if args.batch is not None:
            sources = (args.patch.absolute(), args.retry_patch.absolute() if args.retry_patch is not None else None)
        packet = render(patch, notes, batch=args.batch, mode=args.mode, instruction_report=args.instruction_report,
                        project_report=args.project_report, inspection_reason=args.inspection_reason,
                        retry_patch=retry_patch, retry_notes=retry_notes, checkpoint=args.checkpoint,
                        _sources=sources)
    except (OSError, ValueError, RecursionError) as error:
        parser.exit(1, f"review-packet: {error}\n")
    sys.stdout.buffer.write(packet)


if __name__ == "__main__":
    main()
