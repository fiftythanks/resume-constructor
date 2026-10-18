#!/usr/bin/env bash
set -euo pipefail

# Fail-safe trap
trap 'echo "{}"; exit 0' ERR

# Consume stdin
cat > /dev/null

# Non-mutating fast post-tool hook.
# In accordance with adversarial findings, heavy linters (ESLint/Prettier autofix)
# are excluded to prevent file mutation behind the agent's back, avoiding line-offset
# corruption in consecutive replace_file_content calls and eliminating 6s per-edit latency.
# Formatting and diagnostics are handled via MCP servers (eslint, typescript-lsp)
# and verified during Stop gate execution.
echo "{}"
exit 0
