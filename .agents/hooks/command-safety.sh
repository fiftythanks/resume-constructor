#!/usr/bin/env bash
set -euo pipefail

# Fail-safe trap: default to allow if an unhandled script failure occurs
trap 'echo "{\"decision\":\"allow\"}"; exit 0' ERR

# Read standard input
input=$(cat)
if [ -z "$input" ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

cmd=$(echo "$input" | jq -r '.toolCall.args.CommandLine // empty')
if [ -z "$cmd" ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

# 1. Deny destructive git reset (--hard or --merge)
if echo "$cmd" | grep -qE '(^|[;&|][[:space:]]*)git[[:space:]]+reset([[:space:]]+[^;&|]+)*[[:space:]]+(--hard|--merge)\b|(^|[;&|][[:space:]]*)git[[:space:]]+reset[[:space:]]+(--hard|--merge)\b'; then
  jq -n --arg r "Destructive git command blocked. 'git reset --hard' and 'git reset --merge' discard working directory state. To safely unstage files, use 'git reset HEAD <file>' or 'git reset -- <file>'." \
    '{decision: "deny", reason: $r}'
  exit 0
fi

# 2. Deny force pushes
if echo "$cmd" | grep -qE '(^|[;&|][[:space:]]*)git[[:space:]]+push([[:space:]]+[^;&|]+)*[[:space:]]+(-f\b|--force\b|--force-with-lease\b)|(^|[;&|][[:space:]]*)git[[:space:]]+push[[:space:]]+(-f\b|--force\b|--force-with-lease\b)'; then
  jq -n --arg r "Destructive git push blocked. Force-pushing ('git push --force', '-f', '--force-with-lease') risks overwriting remote commits. Use standard 'git push origin <branch>' without force flags." \
    '{decision: "deny", reason: $r}'
  exit 0
fi

# 3. Deny forbidden shortcut command 'bun run p' or 'bun p'
if echo "$cmd" | grep -qE '(^|[;&|][[:space:]]*)bun([[:space:]]+run)?[[:space:]]+p([[:space:]]+|[;&|]|$)'; then
  jq -n --arg r "Forbidden command blocked ('bun p' / 'bun run p'). The 'p' script triggers 'git add . && git commit && git push origin main', violating the decoupled Phase 4 commit gate and pushing directly to main." \
    '{decision: "deny", reason: $r}'
  exit 0
fi

# 4. Surgical recursive rm validation
if echo "$cmd" | grep -qE '(^|[;&|][[:space:]]*)rm[[:space:]]+(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)'; then
  # Disable file globbing to inspect tokens literally
  set -f
  in_rm=0
  for token in $cmd; do
    if [[ "$token" =~ ^(&&|\|\||;|\|)$ ]]; then
      in_rm=0
      continue
    fi
    if [[ "$token" == "rm" ]]; then
      in_rm=1
      continue
    fi
    if [ $in_rm -eq 1 ]; then
      if [[ "$token" =~ ^- ]]; then
        continue
      fi
      # Normalise target path
      target="${token#./}"
      target="${target%/}"
      case "$target" in
        dist|dist/*|coverage|coverage/*|.vitest|.vitest/*|node_modules/.cache|node_modules/.cache/*|scratch|scratch/*|*/scratch/*|/tmp/*|*.log|.agents/cache|.agents/cache/*)
          # Legitimate build/cache target
          ;;
        *)
          set +f
          jq -n --arg t "$token" \
            '{decision: "deny", reason: ("Destructive deletion blocked for target: \"" + $t + "\". Recursive rm is strictly restricted to designated build and cache artifacts (dist, node_modules/.cache, .vitest, coverage, scratch).")}'
          exit 0
          ;;
      esac
    fi
  done
  set +f
fi

# 5. Bare bun test interception and rewrite
# Matches "bun test" but NOT "bun test:ci", "bun test:browser" or "bun run test"
if echo "$cmd" | grep -qE '(^|[;&|][[:space:]]*)bun[[:space:]]+test([[:space:]]+[^:]|$)'; then
  rewritten_cmd=$(echo "$cmd" | sed -E 's/(^|[;&|][[:space:]]*)bun[[:space:]]+test([[:space:]]+|$)/\1bun run test\2/g')
  jq -n --arg orig "$cmd" --arg rew "$rewritten_cmd" \
    '{
      decision: "allow",
      reason: "Rewrote bare '\''bun test'\'' to '\''bun run test'\'' to invoke the three-tier Vitest test runner instead of Bun native test runner.",
      overwrite: {
        CommandLine: $rew
      }
    }'
  exit 0
fi

# Default allow
echo '{"decision":"allow"}'
exit 0
