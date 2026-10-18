#!/usr/bin/env bash
set -euo pipefail

# Fail-safe trap: default to allow if an unhandled script failure occurs
trap 'echo "{\"decision\":\"allow\",\"reason\":\"Stop gate encountered an unhandled script error; failing open.\"}"; exit 0' ERR

# Read standard input
input=$(cat)
if [ -z "$input" ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

execution_num=$(echo "$input" | jq -r '.executionNum // 1')
termination_reason=$(echo "$input" | jq -r '.terminationReason // "NO_TOOL_CALL"')
workspace_path=$(echo "$input" | jq -r '.workspacePaths[0] // empty')

# 1. Infinite loop breaker: prevent token exhaustion if executionNum > 2
if [ "$execution_num" -gt 2 ]; then
  echo '{"decision":"allow","reason":"Warning: Stop gate loop limit reached (executionNum > 2). Allowing exit to prevent infinite loop and token exhaustion."}'
  exit 0
fi

# 2. Terminal reasons that should not be blocked
case "$termination_reason" in
  USER_CANCELED|MAX_INVOCATIONS|MAX_FORCED_INVOCATIONS|MAX_TOKEN_BUDGET_EXCEEDED|ERROR)
    echo '{"decision":"allow"}'
    exit 0
    ;;
esac

# 3. Resolve repository root
if [ -n "$workspace_path" ] && [ -d "$workspace_path" ]; then
  cd "$workspace_path"
else
  REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
  cd "$REPO_ROOT"
fi

# 4. Fast path: check git working tree status
git_status=$(git status --porcelain -uall)
if [ -z "$git_status" ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

# Categorise changed files
changed_code_files=()
changed_md_files=()
newly_added_files=()

while IFS= read -r line; do
  [ -z "$line" ] && continue
  status_code="${line:0:2}"
  file_path="${line:3}"
  # Strip surrounding quotes if git porcelain outputs them
  file_path="${file_path%\"}"
  file_path="${file_path#\"}"

  # Check if newly created (untracked ?? or staged added A)
  if [[ "$status_code" =~ ^(\?\?|A[[:space:]]|[[:space:]]A) ]]; then
    newly_added_files+=("$file_path")
  fi

  # Track source code files in src/
  if [[ "$file_path" =~ \.(ts|tsx)$ ]] && [[ "$file_path" =~ ^src/ ]]; then
    changed_code_files+=("$file_path")
  fi

  # Track markdown documentation files
  if [[ "$file_path" =~ \.md$ ]]; then
    changed_md_files+=("$file_path")
  fi
done <<< "$git_status"

# If no code files and no markdown files were modified, exit immediately (<30ms)
if [ ${#changed_code_files[@]} -eq 0 ] && [ ${#changed_md_files[@]} -eq 0 ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

failures=()

# 5. Prose Style Audit across modified files
prose_output=""
if ! prose_output=$(bun run lint:prose 2>&1); then
  error_summary=$(echo "$prose_output" | head -n 12)
  failures+=("Prose style check failed (bun run lint:prose):\n$error_summary")
fi

# 6. TypeDoc Entrypoint Audit
docs_output=""
if ! docs_output=$(bun run check:docs 2>&1); then
  error_summary=$(echo "$docs_output" | head -n 12)
  failures+=("TypeDoc documentation parity check failed (bun run check:docs):\n$error_summary")
fi

# 7. Static Type Safety (bun x tsc --noEmit)
if [ ${#changed_code_files[@]} -gt 0 ]; then
  tsc_output=""
  if ! tsc_output=$(bun x tsc --noEmit 2>&1); then
    error_summary=$(echo "$tsc_output" | head -n 12)
    failures+=("Static type checking failed (bun x tsc --noEmit):\n$error_summary")
  fi
fi

# 8. Targeted Vitest Suite
if [ ${#changed_code_files[@]} -gt 0 ]; then
  # Wait if another vitest instance is currently running to avoid Chromium port collision
  wait_cycles=0
  while pgrep -f "vitest" >/dev/null 2>&1 && [ "$wait_cycles" -lt 30 ]; do
    sleep 1
    wait_cycles=$((wait_cycles + 1))
  done

  vitest_output=""
  if ! vitest_output=$(bun x vitest related --run --bail=1 "${changed_code_files[@]}" --passWithNoTests 2>&1); then
    error_summary=$(echo "$vitest_output" | tail -n 20)
    failures+=("Targeted Vitest tests failed for modified files (${changed_code_files[*]}):\n$error_summary")
  fi
fi

# 9. Format final decision
if [ ${#failures[@]} -gt 0 ]; then
  combined_reason=$(printf '%s\n\n' "${failures[@]}")
  jq -n --arg r "$combined_reason" \
    '{
      decision: "continue",
      reason: ("Stop Gate Quality Enforcer blocked exit due to verification failures:\n\n" + $r + "Please address the issues above and re-verify before concluding your turn.")
    }'
  exit 0
else
  echo '{"decision":"allow"}'
  exit 0
fi
