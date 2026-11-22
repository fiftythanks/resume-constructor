Source: https://github.com/addyosmani/agent-skills
Base revision: 39b723ceebf81474d0557c1fecd01eddab585563

## Attribution and licence

The pinned [upstream README](https://github.com/addyosmani/agent-skills/blob/39b723ceebf81474d0557c1fecd01eddab585563/README.md#team)
credits Addy Osmani as creator and Federico Bartoli and Joan León as collaborators.
The upstream [plugin manifest](https://github.com/addyosmani/agent-skills/blob/39b723ceebf81474d0557c1fecd01eddab585563/plugin.json)
names Addy Osmani as author.
The [upstream code-simplification skill](https://github.com/addyosmani/agent-skills/blob/39b723ceebf81474d0557c1fecd01eddab585563/skills/code-simplification/SKILL.md#L8)
credits Anthropic's Claude Code Simplifier plugin as its inspiration.

The [retained MIT licence](LICENSE.addy-agent-skills) is the complete upstream
`LICENSE`, including `Copyright (c) 2025 Addy Osmani` and the requirement to
include the copyright and permission notices in copies or substantial portions
of the software.

## Import and local adaptations

The import accounts for 53 paths in the pinned `agents/`, `commands/`,
`references/` and `skills/` trees, with local paths under `.agents/`.
The local review tooling in `.agents/scripts/` is outside this import.

The following counts describe the initial import, before later language edits.

- **Converted (9):** Upstream `commands/*.toml` became native OMP Markdown
  definitions in `commands/`. The `build`, `code-simplify`, `constraints`,
  `planning`, `ship`, `spec`, `test` and `webperf` basenames stayed the same.
  The upstream README advertises `/plan`, but the source is `commands/planning.toml`.
  `commands/review.toml` became [`commands/project-review.md`](commands/project-review.md)
  to avoid OMP's bundled `/review`.
- **Unchanged (4):** `skills/interview-me/SKILL.md` and
  `skills/idea-refine/frameworks.md`, `skills/idea-refine/refinement-criteria.md`
  and `skills/idea-refine/scripts/idea-refine.sh`.
- **Removed without replacement (2):** `skills/constraint-driven-development/references/floor-guard.md`
  and `skills/constraint-driven-development/scripts/quality-gate.mjs`.
  Neither was wired into project verification.
- **Retired reference (1):** `references/definition-of-done.md` was retired in
  favour of the [canonical project Definition of Done](../docs/reference/verification.md#definition-of-done).
- **Adapted in place (37):** All other pinned paths in `agents/`, `references/`
  and `skills/` were retained at the same relative paths with local changes.

The adaptations kept test-driven development, scoped review to the selected
change and separated release readiness from publication authority. The
constraint workflow draws on existing project standards and checks for
assessment, read-only review and threshold proposals. Simplification and web
performance work were scoped to the selected target and available evidence.
The shipping skill uses the shared checklist's Core Web Vitals bands for
diagnosis, not as release gates.
