#!/usr/bin/env bash
set -euo pipefail

# Fail-safe trap: default to empty injectSteps if an error occurs
trap 'echo "{\"injectSteps\":[]}"; exit 0' ERR

# Consume stdin
cat > /dev/null

# Construct transient ephemeral reminder injected before each model invocation
jq -n '{
  injectSteps: [
    {
      ephemeralMessage: "Invariant reminder: Use \"bun run test\" (never bare \"bun test\"), omit Oxford commas in lists, register new public exports in docs/astro.config.ts and verify types with \"bun x tsc --noEmit\"."
    }
  ]
}'
exit 0
