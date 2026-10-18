---
name: code-hygiene-verifier
description: >-
  Use this skill when diagnosing, repairing or verifying type errors, ESLint violations, Stylelint ordering
  issues, formatting inconsistencies, TypeDoc documentation parity and prose style rules across existing files.
  Documents execution of the modular bun run verify suite (--types, --lint, --styles, --tests, --docs, --prose)
  and fast in-context MCP repair tools (lsp_diagnostics, lint-files). Do NOT use for authoring new component markup
  (use component-authoring) or designing new test suites (use testing-patterns).
---

# Code Hygiene & Verification Runbook

Follow this runbook after making changes or when diagnosing failing builds, commits or CI checks.

> [!NOTE]
> When resolving complex import or JSX prop sorting errors reported by `eslint-plugin-perfectionist`, read `references/perfectionist-rules.md` for the explicit grouping precedence.

---

## 1. Instant In-Context Diagnostics (MCP Tools)

Before invoking CLI runners, inspect diagnostics directly in-context:

- **`lsp_diagnostics` (`typescript-lsp`):** Sub-second TypeScript diagnostics without compiler invocation.
- **`lint-files` (`eslint`):** Rapid lint diagnostics across modified files.
- **`ast-grep` (`find_code` / `find_code_by_rule`):** Search syntax trees for anti-patterns (e.g. `$EXPR!` non-null assertions, `forwardRef`).

---

## 2. Modular Verification Runner (`bun run verify`)

The repository provides a modular, multi-flag verification runner in `scripts/verify.ts`:

```bash
# Run complete verification pipeline
bun run verify --all

# Run specific verification steps during iterative work
bun run verify --types     # TypeScript compiler check (tsc --noEmit)
bun run verify --lint      # ESLint with automated fixes
bun run verify --styles    # Stylelint SCSS concentric order check and fixes
bun run verify --tests     # Vitest related test runner
bun run verify --docs      # Starlight TypeDoc documentation parity check
bun run verify --prose     # Quote and British English prose style validator

# Check-only mode without applying automated fixes
bun run verify --check-only
```

> [!IMPORTANT]
> Never run bare `bun test`. Bun's native test runner does not use the three-tier Vitest project configuration (`unit`, `component` and `browser`). Always run `bun run test` (for the full suite) or `bun run verify --tests` (for targeted test runs).

---

## 3. Pre-Push & Full Suite Audit

Before concluding a major milestone or submitting a pull request:

```bash
bun run verify --all && bun run test:ci
```
