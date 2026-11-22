# Verification

Focused checks support atomic local commits. Broader regression and build checks, together with change-specific visual and accessibility evidence, support final local review. The [root authority](../../AGENTS.md#authority) governs review and publication.

Native commands in [`package.json`](../../package.json) own broad verification. `verify` composes them with shell `&&`: the first failure stops later commands and propagates its failure. Invoke an individual package command for focused work. There is no custom verification flag interface. Git hooks and CI call the native checks; `lint-staged` owns staged-file selection and its explicit fixers.

Use Bun for project commands. `bun test` invokes Bun's own runner, not the Vitest projects configured in [`vitest.config.ts`](../../vitest.config.ts). Use the package test commands to reach those projects; the interactive command and non-interactive CI command serve different execution modes.

Keep source mutation explicit: broad checking does not autofix, while staged fixers do. Review resulting mutations as part of the change. Review prose against [Prose](prose.md), not a custom checker. Configuration remains authoritative for exact commands and selection patterns.

Passing checks does not establish test-first order, coverage adequacy, approval or full accessibility. Record actual command results and any skipped checks; do not turn a blocked build into a success claim.

## Local code review

1. Use Plannotator's browser code-review interface (`plannotator review`) for the authorised hand-off, not Herdr Annotate's document view. Select the checkout, base and diff mode for the approved scope. Use an isolated checkout if unrelated changes would appear in the review. For example, use `plannotator review --git --diff-type last-commit --gate --json` only when the target checkout's `HEAD` is the commit to review.
2. Start the CLI as a managed background job that captures stdout, stderr and the exit result. Let Plannotator open the review automatically in the user's browser. Do not launch the CLI in a Herdr pane or terminal tab. Listen for readiness or a startup error, confirm the review shows the intended change and give the user the local URL.
3. Keep listening for the final decision after handing off the URL. Treat explicit approval of that change as local acceptance; annotations, dismissal, process exit alone and missing output are not approval. Report a missing CLI or failed launch rather than silently substituting the TUI.

## Diagnostic tools

Verify a new or changed tool integration through a representative operation on its intended target, not installation or tool discovery alone. Check the relevant permissions, data handling and failure behaviour. A comparative benchmark is needed only when the accepted outcome includes a comparative claim.

For PDF semantic diagnostics, run veraPDF with an explicit PDF/UA profile and retain the validator version, selected profile, input identity and report. Automatic profile selection can fall back to PDF/A, which does not answer the same question. Follow [Accessibility](accessibility.md) for the distinction between machine checks, meaningful semantics and current export limitations; browser audits do not verify the exported document. This diagnostic tooling does not introduce a blanket PDF/UA-conformance gate or replace preview/export parity checks.

## Definition of Done

Acceptance criteria define the requested outcome; this standing standard defines when the work is complete. Both must be satisfied. Assess every applicable item for each change; task, feature and release labels do not postpone relevant requirements. A local commit is a checkpoint, not final acceptance.

- [ ] **Correctness and integration:** Acceptance criteria are met, relevant edge cases and error paths are handled and the change works with affected parts of the system.
- [ ] **Behavioural evidence:** Exercise changed executable behaviour in the appropriate runtime rather than relying on compilation or type checking. Use a browser when the contract depends on native browser mechanics or layout. Check documentation accuracy and affected links; for agent instructions, also check behavioural interpretation. Documentation-only changes do not require invented application tests.
- [ ] **Tests and checks:** Follow [Testing](testing.md) for changed behaviour and behaviour-preserving refactors. The checks required for the approved scope and checkpoint pass, including applicable regression, build and configured quality checks.
- [ ] **Quality and scope:** Review clarity and unnecessary duplication using the [implementation conventions](typescript-react.md); retain useful comments and avoid abstractions for superficial similarity. Leave no change-related dead code, temporary debug output or obsolete commented-out code. Keep edits within the approved scope.
- [ ] **Documentation:** Affected documentation is accurate and complete under [Documentation](documentation.md), including meaningful architectural rationale. References describe the current state; ADRs, migration guides and changelogs retain the history needed for their purpose.
- [ ] **Product and accessibility:** Verify affected requirements in [Product](product.md) and [Accessibility](accessibility.md), including standard preview/PDF parity where affected. Preserve the distinction between current requirements and future goals; report capability limitations without claiming verified conformance.
- [ ] **Security and operational risk:** Review security and privacy implications of changed untrusted input, authentication or data handling. Account for affected migrations, configuration, feature flags and public-interface compatibility. For operationally risky changes, verify the approved diagnostics and recovery approach. Keep telemetry, infrastructure and compatibility commitments within approved scope and decision authority; do not collect CV content merely to satisfy this checklist.
- [ ] **Review and authority:** Satisfy the [root authority](../../AGENTS.md#authority) for independent review, local acceptance, publication and merge.

An applicable failed or blocked gate prevents completion; it does not authorise unrelated fixes. Changes to this standard or waivers require explicit user approval under the root authority, not a lower bar chosen under deadline pressure.
