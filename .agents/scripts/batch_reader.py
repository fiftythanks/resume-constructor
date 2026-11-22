"""Present validated numbered patch inputs without changing their raw bytes."""

from dataclasses import dataclass
import re
import unicodedata

from batch_report import load_report


BODY_COLUMNS = 78  # Annotate adds a two-cell gutter.
_BODY_TEXT_COLUMNS = BODY_COLUMNS - 2  # Markdown hard break.
_CHECKPOINT = re.compile(r"([FR])([1-9][0-9]*)")
# Annotate enables math, superscript, subscript and autolinks as well as CommonMark.
_MARKUP = frozenset(r"\`*_~^$[](){}<>|!&:@")


def body_width(text):
    """Conservatively count the cells of display-safe, tab-free text."""
    if text.isascii():
        return len(text)
    # _units spells out scalars with exceptional widths. Counting marks as at
    # least one also budgets for variation selectors that widen their base.
    return sum(2 if unicodedata.east_asian_width(char) in {"W", "F"} else 1 for char in text)


def _plain(value, address):
    if not isinstance(value, str) or not value.strip() or any(
        unicodedata.category(char) == "Cc" and char not in "\t\r\n" for char in value
    ):
        raise ValueError(f"{address}: expected nonblank text without control characters")
    return value


def _units(text, *, markup=False):
    last_nonspace = len(text.rstrip(" ")) if not markup else len(text)
    for index, char in enumerate(text):
        if char == "\t":
            yield "⇥"
        elif char == " " and (markup or index >= last_nonspace):
            yield "␠"
        elif char in {"⇥", "↳", "␠", "\\"}:
            # Markdown consumes one layer of backslash escapes in prose.
            encoded = "\\" + char
            yield encoded.replace("\\", "\\\\") if markup else encoded
        # Annotate reserves extra cells for these Khmer signs; Herdr reports
        # the padding as spaces. Unassigned scalars may have a width in newer
        # Unicode tables. Spell them out to keep the change and receipt legible.
        elif char in {"\u17a4", "\u17d8"} or (char != " " and char.isspace()) or unicodedata.category(char) in {
            "Cc", "Cf", "Cn", "Cs", "Zl", "Zp",
        }:
            scalar = ord(char)
            if markup:
                yield fr"\\u{scalar:04x}" if scalar <= 0xFFFF else fr"\\U{scalar:08x}"
            else:
                yield fr"\u{scalar:04x}" if scalar <= 0xFFFF else fr"\U{scalar:08x}"
        elif markup and (char in _MARKUP or (char == "." and text[index - 3:index].lower() == "www")):
            yield "\\" + char
        else:
            yield char


def _atoms(text, *, markup=False):
    """Wrap between source bases rather than between a base and its accents."""
    units = _units(text, markup=markup)
    cluster = []
    size = 0
    for char, unit in zip(text, units):
        if cluster and not unicodedata.category(char).startswith("M"):
            yield "".join(cluster)
            cluster, size = [], 0
        if not cluster and unicodedata.category(char).startswith("M"):
            # A mark with no base (or too many marks to fit) must not decorate
            # the gutter. Spell it out instead.
            yield ("\\" if markup else "") + ascii(char)[1:-1]
            continue
        size += body_width(unit)
        if size > _BODY_TEXT_COLUMNS - 2:
            yield "".join(cluster)
            yield ("\\" if markup else "") + ascii(char)[1:-1]
            cluster, size = [], 0
        else:
            cluster.append(unit)
    if cluster:
        yield "".join(cluster)


def _paragraph(prefix, text):
    """Hard-wrap literal prose, with a non-spoofable marker on continuation lines."""
    limit = _BODY_TEXT_COLUMNS
    line = prefix
    width = body_width(line)
    with_text = False
    # Only a single interior ASCII space is an ordinary word separator.
    # Repeated, leading and trailing spaces and other whitespace are data.
    for word in re.split(r"(?<=[^ ]) (?=[^ ])", text):
        atoms = tuple((atom, body_width(atom)) for atom in _atoms(word, markup=True))
        if with_text:
            if width + 1 + sum(size for _, size in atoms) <= limit:
                line += " "
                width += 1
            else:
                yield line + "  \n"
                # This wrap replaces a source separator, unlike a wrap inside
                # a token. Keep that space visible in filename/decision text.
                line, width = "↳ ␠", 3
        for atom, size in atoms:
            if width + size > limit:
                yield line.rstrip(" ") + "  \n"
                line, width = "↳ ", 2
            line += atom
            width += size
        with_text = True
    yield line.rstrip(" ") + "\n\n"


def _code_line(text, prefix, continuation):
    payload = ""
    width = body_width(prefix)
    for atom in _atoms(text):
        size = body_width(atom)
        if width + size > BODY_COLUMNS:
            # Padding at the right edge of a pane is indistinguishable from
            # source spaces. Make stranded payload spaces visible before wrap.
            stripped = payload.rstrip(" ")
            yield prefix + stripped + "␠" * (len(payload) - len(stripped)) + "\n"
            prefix, payload, width = continuation, "", body_width(continuation)
        payload += atom
        width += size
    yield prefix + payload + "\n"


def _diff(rows):
    yield "```diff\n"
    for address, record, marker in rows:
        if address is not None:
            sign = record[0]
            yield from _code_line(record[1:], sign, sign + "↳ ")
        elif record.startswith(" "):
            # An explicit context prefix also keeps literal backtick-only
            # context from becoming a Markdown closing fence.
            yield from _code_line(record[1:], "  │ ", "  ↳ ")
        else:
            yield from _code_line(record, "", "  ↳ ")
        if marker:
            yield "\\ No newline at end of file\n"
    yield "```\n\n"


@dataclass(frozen=True)
class _Group:
    number: int
    members: tuple  # (parsed row, reason), sorted old then new


@dataclass(frozen=True)
class _Hunk:
    header: str
    reason: str
    events: tuple  # context rows and addressed groups
    first: int
    last: int


def _rationales(path, hunks, notes):
    if not isinstance(notes, dict):
        raise ValueError(f"{path!r}: expected an object mapping addresses to reasons")
    positions = {addr: (hunk, index) for hunk, (changed, _, _) in hunks.items()
                 for index, addr in enumerate(changed)}
    hunk_reasons, groups = {}, {}
    for key, value in notes.items():
        location = f"{path!r} {key!r}"
        if key in hunks:
            hunk_reasons[key] = _plain(value, location)
            continue
        if key in positions:
            members = (key,)
        else:
            declared = key.split("/")
            hunk = positions.get(declared[0], (None,))[0]
            if (len(declared) < 2 or len(set(declared)) != len(declared) or hunk is None
                    or any(positions.get(addr, (None,))[0] != hunk for addr in declared)):
                raise ValueError(f"{path!r}: unknown address or invalid replacement group {key!r}")
            members = tuple(sorted(declared, key=lambda addr: (addr[0] == "+", positions[addr][1])))
        if isinstance(value, dict) and len(members) > 1:
            if value.keys() != set(members):
                raise ValueError(f"{location}: expected exactly one reason per group member")
            reasons = tuple(_plain(value[addr], f"{location} {addr}") for addr in members)
        else:
            reasons = (_plain(value, location),) * len(members)
        group = tuple(zip(members, reasons))
        for addr in members:
            if addr in groups:
                raise ValueError(f"{path!r}: duplicate rationale for {addr}")
            groups[addr] = group
    for hunk, (changed, _, _) in hunks.items():
        if hunk not in hunk_reasons:
            raise ValueError(f"{path!r}: missing rationale for {hunk}")
        for addr in changed:
            if addr not in groups:
                raise ValueError(f"{path!r}: missing rationale for {addr}")
    return hunk_reasons, groups


def numbered_files(files, notes):
    """Validate complete coverage and assign source-ordered group numbers."""
    result, number = [], 0
    for path, (headers, hunks) in files.items():
        hunk_reasons, group_for = _rationales(path, hunks, notes[path])
        displayed = []
        for key, (_, header, rows) in hunks.items():
            by_addr = {row[0]: row for row in rows if row[0] is not None}
            emitted = set()
            events = []
            first = number + 1
            for row in rows:
                address = row[0]
                if address is None:
                    events.append(row)
                elif address not in emitted:
                    members = group_for[address]
                    number += 1
                    events.append(_Group(number, tuple((by_addr[addr], reason) for addr, reason in members)))
                    emitted.update(addr for addr, _ in members)
            displayed.append(_Hunk(header, hunk_reasons[key], tuple(events), first, number))
        result.append((path, headers, displayed))
    return result, number


def _file_sections(files, kind, start, *, resume=False):
    for path, headers, hunks in files:
        if hunks[-1].last < start:
            continue
        opening = [*_paragraph("**File:** ", path), *_diff((None, header, False) for header in headers)]
        for hunk in hunks:
            if hunk.last < start:
                continue
            opening.extend(_paragraph("**Hunk:** ", hunk.reason))
            opening.extend(_diff(((None, hunk.header, False),)))
            if not resume:
                yield from opening
                opening.clear()
            visible = hunk.first >= start
            context = []
            for event in hunk.events:
                if isinstance(event, _Group):
                    if event.number < start:
                        continue
                    visible = True
                    if context and not resume:
                        yield from _diff(context)
                        context.clear()
                    for row, reason in event.members:
                        group = f"{kind}{event.number}"
                        prefix = f"**{group} · {row[0]}:** "
                        if body_width(prefix) > _BODY_TEXT_COLUMNS - 10:
                            yield from _paragraph(f"**{group} address:** ", row[0])
                            prefix = "**Reason:** "
                        yield from _paragraph(prefix, reason)
                        yield from _diff((row,))
                    if resume:
                        yield f"**Context for {kind}{event.number}:**\n\n"
                        yield from opening
                        if context:
                            yield from _diff(context)
                            context.clear()
                        opening.clear()
                        resume = False
                elif visible:
                    context.append(event)
            if context:
                yield from _diff(context)


def _decisions(rows):
    yield "## Project-specific decisions\n\n"
    if not isinstance(rows, list):
        raise ValueError("project_decisions must be an array")
    if not rows:
        yield "No project-specific decisions were recorded for this patch.\n\n"
    for index, row in enumerate(rows, 1):
        address = f"project_decisions entry {index}"
        if not isinstance(row, dict) or row.keys() != {"before", "after", "judge"}:
            raise ValueError(f"{address}: expected exactly before, after and judge")
        if index == 2:
            yield "**Further local decisions**\n\n"
        for key, label in (("before", "Before"), ("after", "Draft"), ("judge", "Judgement")):
            yield from _paragraph(f"**{label}:** ", _plain(row[key], f"{address} {key}"))
        if index == 1:
            yield "End of first decision.\n\n"


def _reports(instruction_report, project_report, mode, digest):
    for stage, path, expected in (
        ("instruction", instruction_report, "PASS"),
        ("project", project_report, "APPROVE"),
    ):
        if path is None:
            continue
        try:
            report = load_report(path, stage, digest)
        except (ValueError, OSError) as error:
            raise ValueError(f"{stage} report: {error}") from None
        verdict = report["verdict"]
        if mode == "acceptance" and (verdict != expected or report["findings"]):
            raise ValueError(f"{stage} report must have verdict {expected} and no findings in acceptance mode")
        yield from _paragraph(f"**{stage.capitalize()} review ({verdict}):** ", report["summary"])
        for finding in report["findings"]:
            yield from _paragraph("**Location:** ", finding["location"])
            yield from _paragraph("**Consequence:** ", finding["consequence"])


def feedback_sections(feedback, full_digest):
    """The record type, not the punctuation in quoted text, determines its role."""
    if (not isinstance(feedback, dict) or feedback.keys() != {"patch_sha256", "comments"}
            or feedback["patch_sha256"] != full_digest):
        raise ValueError("feedback must identify the exact full patch and contain comments")
    records = feedback["comments"]
    if not isinstance(records, list) or not records:
        raise ValueError("feedback requires a nonempty ordered list of numbered records")
    yield "\n## Human feedback and responses\n\n"
    yield "Quotations are not reviewed changes. Exact records: `FEEDBACK.json`.\n\n"
    for n, record in enumerate(records, 1):
        if (not isinstance(record, dict) or record.keys() != {"number", "comment", "response"}
                or type(record["number"]) is not int or record["number"] != n):
            raise ValueError(f"feedback record {n}: expected number {n}, comment and response")
        yield f"### Feedback {n}\n\n"
        for key, label in (("comment", "Human comment"), ("response", "Agent response")):
            text = record[key]
            if not isinstance(text, str) or not text.strip():
                raise ValueError(f"feedback {n} {key}: expected nonblank text")
            yield f"**{label}:**\n\n```text\n"
            for line in text.replace("\r\n", "\n").split("\n"):
                yield from _code_line(line, "│ ", "↳ ")
            yield "```\n\n"


def _changes(full_files, retry_files, retry_digest, kind, start, *, resume=False):
    if kind == "F":
        yield "## Full patch changes\n\n"
        yield from _file_sections(full_files, "F", start, resume=resume)
    if retry_digest is not None:
        yield f"## Retry patch · {retry_digest[:12]}\n\n"
        yield from _file_sections(retry_files, "R", start if kind == "R" else 1, resume=resume and kind == "R")


def _raw_source(label, source):
    if source is None:
        return
    if source.is_absolute():
        yield f"**{label} raw input (absolute path):**\n\n```text\n"
        yield from _code_line(str(source), "", "↳ ")
        yield "```\n\n"
    else:
        if source.parts != (f"{label.upper()}.patch",):
            raise ValueError("unexpected packet-local raw input name")
        yield f"**{label} raw artifact (beside this view):** `{source}`\n\n"


def batch_sections(batch, mode, digest, full, retry, decisions, checkpoint,
                   inspection_reason, instruction_report, project_report, *, sources):
    full_files, full_count = full
    retry_digest, retry_files, retry_count = retry if retry is not None else (None, (), 0)
    start_kind, start = "F", 1
    if checkpoint is not None:
        match = _CHECKPOINT.fullmatch(checkpoint)
        if match:
            start_kind, number = match.groups()
            maximum = full_count if start_kind == "F" else retry_count
            if len(number) <= len(str(maximum)) and int(number) <= maximum:
                start = int(number)
            else:
                match = None
        if match is None:
            raise ValueError(f"unknown checkpoint {checkpoint!r}; use a displayed F or R group ID")

    heading = f"# Full Batch {batch} patch"
    if body_width(heading) > BODY_COLUMNS:
        raise ValueError("--batch is too long to display")
    yield heading + "\n\n"
    yield f"**{mode.upper()} · {digest[:12]}**\n\n"
    if checkpoint is not None:
        yield f"First unread: {checkpoint}\n\n"
        yield ("This resumed view is filtered. The checkpoint is not a decision; any  \n"
               "acceptance concerns the exact full patch identified below.\n\n")
        yield from _changes(full_files, retry_files, retry_digest, start_kind, start, resume=True)
    yield from _decisions(decisions)
    if mode == "acceptance":
        yield ("**Decision:** Accept this exact full batch draft, or return comments  \n"
               "for revision.\n\n")
        yield ("**Authority:** Local acceptance does not apply the patch, change the  \n"
               "checklist, or authorise a commit or publication.\n\n")
    else:
        yield ("**Decision:** Inspect this draft and leave comments;  \n"
               "no acceptance is requested or recorded.\n\n")
        yield ("**Authority:** Inspection does not apply the patch, change the checklist,  \n"
               "or authorise a commit or publication.\n\n")
        yield from _paragraph("**Inspection reason:** ", _plain(inspection_reason, "--inspection-reason"))
    yield from _reports(instruction_report, project_report, mode, digest)
    full_source, retry_source = sources
    yield from _raw_source("Full", full_source)
    yield f"**Patch SHA-256:**  \n`{digest}`\n\n"
    if retry_digest is not None:
        yield from _raw_source("Retry", retry_source)
        yield f"**Retry SHA-256:**  \n`{retry_digest}`\n\n"
        yield "The retry delta explains revisions only; it is not a separate approval.\n\n"
    yield ("↳ continues a display line and ⇥ represents a tab. ␠ shows significant  \n"
           "spaces, including spaces at the right edge. Literal markers and  \n"
           "backslashes are escaped. Raw inputs retain exact bytes.\n\n")
    if checkpoint is None:
        yield from _changes(full_files, retry_files, retry_digest, "F", 1)
