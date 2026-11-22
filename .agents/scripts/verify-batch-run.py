"""Verify the primary journal and captured stdout from the same successful, fresh OMP print invocation."""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path


class VerificationError(Exception):
    """A failure with a diagnostic safe to report without the journal."""


def verify(session_dir, output, provider, model, effort):
    journals = list(session_dir.glob('*.jsonl'))
    if len(journals) != 1:
        raise VerificationError('expected exactly one immediate primary journal')
    journal, = journals
    if journal.is_symlink() or not journal.is_file():
        raise VerificationError('primary journal is not a regular file')

    started_at = None
    active_effort = None
    user_turns = 0
    last_message = None
    with journal.open(encoding='utf-8') as source:
        for line in source:
            entry = json.loads(line)
            if not isinstance(entry, dict):
                raise VerificationError('invalid primary journal entry')
            kind = entry.get('type')
            if kind == 'session':
                timestamp = entry.get('timestamp')
                if started_at is not None or user_turns or not isinstance(timestamp, str):
                    raise VerificationError('invalid primary session header')
                started_at = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                if started_at.tzinfo is None:
                    raise VerificationError('invalid primary session timestamp')
            elif kind == 'thinking_level_change':
                active_effort = entry.get('thinkingLevel')
            elif kind == 'message':
                last_message = entry.get('message')
                if not isinstance(last_message, dict):
                    raise VerificationError('invalid primary journal message')
                role = last_message.get('role')
                if role == 'user':
                    user_turns += 1
                elif role == 'assistant':
                    if user_turns != 1:
                        raise VerificationError('expected a single primary user turn')
                    if (last_message.get('provider'), last_message.get('model')) != (provider, model):
                        raise VerificationError('primary assistant provider/model does not match')
                    if active_effort != effort:
                        raise VerificationError('primary assistant active effort does not match')

    if started_at is None:
        raise VerificationError('missing primary session header')
    if user_turns != 1:
        raise VerificationError('expected a single primary user turn')
    if (last_message is None or last_message.get('role') != 'assistant'
            or last_message.get('stopReason') != 'stop' or last_message.get('errorMessage')):
        raise VerificationError('primary final assistant response did not complete')

    content = last_message.get('content')
    if not isinstance(content, list):
        raise VerificationError('invalid final assistant content')
    text_blocks = []
    for block in content:
        if not isinstance(block, dict):
            raise VerificationError('invalid final assistant content')
        if block.get('type') == 'toolCall':
            raise VerificationError('primary final assistant response did not complete')
        if block.get('type') == 'text':
            text = block.get('text')
            if not isinstance(text, str):
                raise VerificationError('invalid final assistant text block')
            text_blocks.append(text)
    final_text = '\n'.join(text_blocks)
    if not final_text.strip():
        raise VerificationError('primary final assistant text is empty')

    # OMP print mode joins its text blocks with LF and adds one framing LF.
    expected = (final_text + '\n').encode('utf-8')
    if not output.is_file():
        raise VerificationError('captured stdout is not a regular file')
    with output.open('rb') as capture:
        # Journal metadata can be flushed after stdout; use the session start instead.
        if os.fstat(capture.fileno()).st_mtime < started_at.timestamp():
            raise VerificationError('captured stdout predates the primary session')
        actual = capture.read(len(expected) + 1)
    if not actual:
        raise VerificationError('captured stdout is empty')
    if actual != expected:
        raise VerificationError('captured stdout does not match the final assistant text')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('session_dir', type=Path, metavar='SESSION_DIR')
    parser.add_argument('output', type=Path, metavar='OUTPUT')
    parser.add_argument('model', metavar='PROVIDER/MODEL')
    parser.add_argument('effort', metavar='EFFORT')
    args = parser.parse_args()
    provider, _, model = args.model.partition('/')
    if not provider or not model or not args.effort:
        parser.error('expected a provider/model and a nonempty effort')
    try:
        verify(args.session_dir, args.output, provider, model, args.effort)
    except VerificationError as error:
        print(f'Batch run verification failed: {error}', file=sys.stderr)
        return 1
    except (OSError, ValueError, RecursionError):
        print('Batch run verification failed: cannot read the primary journal or stdout', file=sys.stderr)
        return 1
    print('Verified primary assistant provider/model, active effort and final stdout.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
