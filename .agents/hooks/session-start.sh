#!/usr/bin/env bash
set -euo pipefail

# Fail-safe trap: default to empty injectSteps if an error occurs
trap 'echo "{\"injectSteps\":[]}"; exit 0' ERR

# Consume stdin (discard or ignore)
cat > /dev/null

# Construct injected system message with core workspace invariants
jq -n '{
  injectSteps: [
    {
      systemMessage: {
        systemMessage: "=== WORKSPACE INVARIANTS & HOOK POLICIES ===\n\n1. Testing Policy: Always use \"bun run test\" or the vitest MCP server. NEVER execute bare \"bun test\" (which bypasses the Vitest multi-project test configuration). Run targeted tests via \"bun x vitest related --run --bail=1 <files> --passWithNoTests\".\n\n2. Strict Oxford Comma Prohibition: Never place a comma before coordinating conjunctions (\"and\" or \"or\") in commit messages, docstrings, code comments or documentation. Verify zero instances of \", and \" and \", or \". Use traditional British English spelling.\n\n3. Documentation Parity (TypeDoc): Any newly created public barrel export in src/components/*/index.tsx, src/pages/*/index.tsx, src/hooks/use*.ts or src/utils/*.ts MUST be registered in docs/astro.config.ts under starlightTypeDoc.entryPoints.\n\n4. Command Safety: Destructive git commands (\"git reset --hard\", \"git reset --merge\", \"git push --force\") and \"bun run p\" / \"bun p\" are blocked by PreToolUse hooks. Recursive rm is strictly restricted to build/cache directories (dist, node_modules/.cache, .vitest, coverage).\n\n5. Stop Gate Quality Enforcer: The Stop hook verifies static types (\"bun x tsc --noEmit\") and targeted Vitest test suites on modified code before session completion."
      }
    }
  ]
}'
exit 0
