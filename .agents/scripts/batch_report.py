"""Validate a stage report against the SHA-256 of the exact patch bytes.

On success, print the verdict alone. A valid negative verdict also succeeds:
this checks structure and patch identity, not provenance, substance or approval.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata


_VERDICTS = {
    "instruction": ("PASS", "REVISE"),
    "project": ("APPROVE", "REQUEST_CHANGES"),
}
_SHA256 = re.compile(r"[0-9a-f]{64}")
_UNSAFE_TEXT_CATEGORIES = {"Cc", "Cf", "Cs", "Zl", "Zp"}


def _unique_object(pairs):
    fields = {}
    for key, value in pairs:
        if key in fields:
            raise ValueError("duplicate report key")
        fields[key] = value
    return fields


def _is_text(value):
    return isinstance(value, str) and bool(value.strip()) and not any(
        unicodedata.category(char) in _UNSAFE_TEXT_CATEGORIES for char in value
    )


def load_report(path: Path, stage: str, digest: str) -> dict:
    """Return a structurally valid report for the stage and exact patch digest.

    Raise ValueError for invalid evidence or OSError if the report cannot be
    read. Callers verify provenance separately and assess the review's substance.
    """
    if not isinstance(stage, str) or stage not in _VERDICTS:
        raise ValueError("unknown review stage")
    positive, negative = _VERDICTS[stage]

    try:
        raw = path.read_bytes()
    except OSError:
        raise OSError("cannot read report") from None
    try:
        report = json.loads(raw.decode("utf-8"), object_pairs_hook=_unique_object)
    except (ValueError, RecursionError):
        raise ValueError("expected one UTF-8 JSON report without duplicate keys") from None

    if not isinstance(report, dict) or report.keys() != {
        "verdict", "patch_sha256", "summary", "findings",
    }:
        raise ValueError("invalid report fields")
    verdict = report["verdict"]
    if verdict not in (positive, negative):
        raise ValueError("verdict does not match the review stage")
    patch_sha256 = report["patch_sha256"]
    if not isinstance(patch_sha256, str) or not _SHA256.fullmatch(patch_sha256):
        raise ValueError("expected a lowercase SHA-256 in patch_sha256")
    if patch_sha256 != digest:
        raise ValueError("report does not match the patch digest")
    if not _is_text(report["summary"]):
        raise ValueError("summary must be nonblank single-line text without controls")

    findings = report["findings"]
    if not isinstance(findings, list):
        raise ValueError("findings must be a list")
    if verdict == positive and findings:
        raise ValueError("positive verdict must not report blocking findings")
    if verdict == negative and not findings:
        raise ValueError("negative verdict requires at least one finding")
    for finding in findings:
        if not isinstance(finding, dict) or finding.keys() != {"location", "consequence"}:
            raise ValueError("invalid finding fields")
        if not _is_text(finding["location"]) or not _is_text(finding["consequence"]):
            raise ValueError("finding requires a nonblank single-line location and consequence without controls")
    return report


class _Arguments(argparse.ArgumentParser):
    def error(self, _message):
        # The default error message may echo untrusted arguments.
        super().error("expected a review stage, patch path and report path")


def _main():
    parser = _Arguments(prog="batch_report.py", description=__doc__)
    parser.add_argument("stage", choices=_VERDICTS)
    parser.add_argument("patch", type=Path, metavar="PATCH")
    parser.add_argument("report", type=Path, metavar="REPORT")
    args = parser.parse_args()
    try:
        digest = hashlib.sha256(args.patch.read_bytes()).hexdigest()
    except OSError:
        parser.exit(1, "batch_report.py: cannot read patch\n")
    try:
        report = load_report(args.report, args.stage, digest)
    except (ValueError, OSError) as error:
        parser.exit(1, f"batch_report.py: {error}\n")
    print(report["verdict"])


if __name__ == "__main__":
    _main()
