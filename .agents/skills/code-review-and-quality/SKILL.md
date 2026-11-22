---
name: code-review-and-quality
description: Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch. Use when asked to review a diff or a pull request, even when the diff is pasted inline and the review looks quick to do from reading it.
---

# Code Review and Quality

## Overview

Multi-dimensional code review with quality gates. Every change gets reviewed before merge — no exceptions. Review covers five axes: correctness, readability, architecture, security, and performance.

**The approval standard:** Recommend approval when the change improves overall code health, meets the authorised contract and project conventions, has the evidence required for this scope and checkpoint and leaves no unresolved Critical or Required findings. Don't block a change because it isn't exactly how you would have written it. A technical recommendation is not human acceptance and cannot waive a required check or review under the [root authority](../../../AGENTS.md#authority).

## When to Use

- Before merging any PR or change
- After completing a feature implementation
- When another agent or model produced code you need to evaluate
- When refactoring existing code
- After any bug fix (review both the fix and the regression test)

## The Five-Axis Review

Every review evaluates code across these dimensions:

### 1. Correctness

Does the code do what it claims to do?

- Does it match the spec or task requirements?
- Are edge cases handled (null, empty, boundary values)?
- Are error paths handled (not just the happy path)?
- Does it pass all tests? Are the tests actually testing the right things?
- Are there off-by-one errors, race conditions, or state inconsistencies?

### 2. Readability & Simplicity

Can another engineer (or agent) understand this code without the author explaining it?

- Are names descriptive and consistent with project conventions? (No `temp`, `data`, `result` without context)
- Is the control flow straightforward (avoid nested ternaries, deep callbacks)?
- Is the code organized logically (related code grouped, clear module boundaries)?
- Are there any "clever" tricks that should be simplified?
- **Could this be done in fewer lines?** (1000 lines where 100 suffice is a failure)
- **Are abstractions earning their complexity?** (Don't generalize until the third use case)
- Would comments help clarify non-obvious intent? (But don't comment obvious code.)
- Are there dead code artifacts: no-op variables (`_unused`), backwards-compat shims, or `// removed` comments?
- **Is a new conditional bolted onto an unrelated flow?** That's a design smell, not a nit — push the logic into its own helper, state, or policy instead of tangling an existing path.
- **Do repeated conditionals on the same shape appear?** They signal a missing model or dispatcher. A "temporary" branch is usually permanent debt.

### 3. Architecture

Does the change fit the system's design?

- Does it follow existing patterns or introduce a new one? If new, is it justified?
- Does it maintain clean module boundaries?
- Is there code duplication that should be shared?
- Are dependencies flowing in the right direction (no circular dependencies)?
- Is the abstraction level appropriate (not over-engineered, not too coupled)?
- **Does this refactor reduce complexity or just relocate it?** Count the concepts a reader must hold to follow the change. If a "cleaner" version leaves that count unchanged, it isn't cleaner — prefer the restructuring that makes whole branches, modes, or layers disappear over one that re-centralizes the same logic. Prefer deleting an abstraction to polishing it.
- **Is feature-specific logic leaking into a shared or general-purpose module?** Keep logic in its owning layer, reuse the existing canonical helper instead of a near-duplicate, and don't normalize architectural drift.
- **Are type boundaries explicit?** Question gratuitous `any`/`unknown`/optional/casts and silent fallbacks that paper over an unclear invariant — making the boundary explicit often makes the surrounding control flow simpler.

### 4. Security

For detailed security guidance, see `security-and-hardening`. Does the change introduce vulnerabilities?

- Is user input validated and sanitized?
- Are secrets kept out of code, logs, and version control?
- Is authentication/authorization checked where needed?
- Are SQL queries parameterized (no string concatenation)?
- Are outputs encoded to prevent XSS?
- Are dependencies from trusted sources with no known vulnerabilities?
- Is data from external sources (APIs, logs, user content, config files) treated as untrusted?
- Are external data flows validated at system boundaries before use in logic or rendering?

### 5. Performance

For detailed profiling and optimization, see `performance-optimization`. Does the change introduce performance problems?

- Any N+1 query patterns?
- Any unbounded loops or unconstrained data fetching?
- Any synchronous operations that should be async?
- Any unnecessary re-renders in UI components?
- Any missing pagination on list endpoints?
- Any large objects created in hot paths?

## Structural Remedies

When you flag a structural problem, propose the move — not just the problem. A review that only says "this is complex" leaves the author guessing. Reach for a named restructuring:

- **Replace a chain of conditionals** with a typed model or an explicit dispatcher.
- **Collapse duplicate branches** into a single clearer flow.
- **Separate orchestration from business logic** so each reads on its own.
- **Move feature-specific logic** out of a shared module into the package that owns the concept.
- **Reuse the canonical helper** instead of a bespoke near-duplicate.
- **Make a type boundary explicit** so downstream branching disappears.
- **Delete a pass-through wrapper** that adds indirection without clarifying the API.
- **Extract a helper, or split a large file** into focused modules.

Prefer the remedy that removes moving pieces over one that spreads the same complexity around.

## Change Sizing

Small, focused changes are easier to review, faster to merge, and safer to deploy. Use these figures as prompts to inspect, not limits:

```
~100 lines changed   → Good. Reviewable in one sitting.
~300 lines changed   → Acceptable if it's a single logical change.
~1000 lines changed  → Inspect for distinct outcomes or concrete review gaps.
```

**Watch file size, not just diff size.** Around 1000 _total_ lines in a single file (distinct from ~1000 _changed_ lines) is also an inspection signal. When a change materially grows an already-large file, look for a concrete structural problem, such as a new responsibility tangled with an existing flow. Propose extracting helpers, subcomponents or modules when doing so resolves that problem.

**What counts as "one change":** One coherent outcome with its related tests that leaves the system functional at the checkpoint. Recommend a split when you can name a concrete independent outcome and how to verify it without breaking the authorised contract at either checkpoint. Keep an indivisible outcome together when a split would break callers, need a temporary shim or leave non-functional work. If the size prevents a specific part from being reviewed, identify the gap rather than treating the count as a defect.

**Splitting strategies for independently verifiable outcomes:**

| Strategy          | How                                                                      | When                                           |
| ----------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| **Stack**         | Submit a small change, start the next one based on it                    | Sequential dependencies                        |
| **By file group** | Group files by independently verifiable outcome                          | Distinct outcomes may need different reviewers |
| **Horizontal**    | Land a complete, verifiable lower-layer change first, then its consumers | Layers with independently verifiable outcomes  |
| **Vertical**      | Break into smaller full-stack slices of the feature                      | Feature work                                   |

**When large changes are acceptable:** A coherent change may be large, whether it adds or replaces behaviour. For complete file deletions or automated refactoring, review can often focus on intent and evidence rather than inspecting every line individually.

**Separate refactoring from feature work** when each is independently verifiable. Keep a refactor with the feature when separating it would break an authorised checkpoint. Small related cleanups (variable renaming) can be included at reviewer discretion.

## Change Descriptions

Every change needs a description that stands alone in version control history.

**First line:** Short, imperative, standalone. "Delete the FizzBuzz RPC" not "Deleting the FizzBuzz RPC." Must be informative enough that someone searching history can understand the change without reading the diff.

**Body:** What is changing and why. Include context, decisions, and reasoning not visible in the code itself. Link to bug numbers, benchmark results, or design docs where relevant. Acknowledge approach shortcomings when they exist.

**Anti-patterns:** "Fix bug," "Fix build," "Add patch," "Moving code from A to B," "Phase 1," "Add convenience functions."

## Review Process

### Step 1: Understand the Context

Before looking at code, understand the intent:

```
- What is this change trying to accomplish?
- What spec or task does it implement?
- What is the expected behavior change?
```

### Step 2: Review the Tests First

Tests reveal intent and coverage:

```
- Do tests exist for the change?
- Do they test behavior (not implementation details)?
- Are edge cases covered?
- Do tests have descriptive names?
- Would the tests catch a regression if the code changed?
```

Answer the last question by experiment, not by reading, for an applicable condition added or changed by the diff. Reuse matching experimental evidence for the selected change and affected tests, or run the experiment only with explicit authorisation on an owned disposable copy isolated from the shared worktree. Never mutate the shared checkout, even to restore it afterwards. Establish a passing baseline, then make one intentionally wrong, non-equivalent change that should violate the contract (for example, shift an inclusive boundary by one). Rerun the relevant tests there. A test that fails for the intended reason demonstrates coverage of that regression. If the same tests stay green, report the missing case; an equivalent mutant or unrelated failure doesn't answer the question. If applicable proof is unavailable, report the experiment as unmet and name the regression whose detection remains unproved. Distinguish that from an inapplicable check, such as for a prose-only change. For a project-wide mutation score, see `constraint-driven-development`.

### Step 3: Review the Implementation

Walk through the code with the five axes in mind:

```
For each file changed:
1. Correctness: Does this code do what the test says it should?
2. Readability: Can I understand this without help?
3. Architecture: Does this fit the system?
4. Security: Any vulnerabilities?
5. Performance: Any bottlenecks?
```

### Step 4: Categorize Findings

Before reporting a finding, check it against the callers, guards and tests that reach the changed code, and drop it if they rule it out. Label defects that already exist in the base separately from regressions this change introduces. Zero findings is a valid result; do not invent one.

Use an explicit severity for every actionable finding:

| Prefix        | Meaning            | Author Action                                           |
| ------------- | ------------------ | ------------------------------------------------------- |
| **Critical:** | Blocks merge       | Security vulnerability, data loss, broken functionality |
| **Required:** | Required change    | Must address before merge                               |
| **Nit:**      | Minor, optional    | Author may ignore — formatting, style preferences       |
| **Optional:** | Suggestion         | Worth considering but not required                      |
| **FYI**       | Informational only | No action needed — context for future reference         |

This prevents authors from treating all feedback as mandatory and wasting time on optional suggestions.

**Lead with what matters.** Order findings by leverage: correctness and security first, then structural regressions and missed simplifications, then everything else. Don't bury a real issue under cosmetic nits — a few high-conviction comments beat a long list. If you have one structural problem and ten nits, the structural problem _is_ the review.

### Step 5: Verify the Verification

Check the author's verification story:

```
- What tests were run?
- Did the build pass?
- Was the change tested manually?
- Are there screenshots for UI changes?
- Is there a before/after comparison?
```

Use the applicable [Verification](../../../docs/reference/verification.md) checks for the authorised scope and checkpoint. Separate evidence inspected, checks actually performed, inapplicable checks and required proof that is unavailable. A pasted diff is not a reason to run a fresh application build; say what cannot be established from the supplied evidence.

## Independent Review Pattern

Review an ordinary scoped request directly. For requested independence or pre-hand-off review, use an available fresh-context reviewer through OMP's actual task interface, following [Orchestration patterns](../../references/orchestration-patterns.md). Supply the change and base, contract, applicable project rules and relevant evidence without the author's preferred verdict. Independence comes from the review setup, not the author's identity or the choice of model. If a required independent pass cannot run, report it as unmet; direct review does not substitute for it.

```
Author prepares the change
    │
    ▼
Fresh-context reviewer assesses correctness and architecture
    │
    ▼
Working agent checks findings and addresses them within scope
    │
    ▼
Human makes the final call
```

Fresh context can expose assumptions carried over from the implementation. A different model is optional, not proof of independence.

**Example prompt for a review agent:**

```
Review this code change for correctness, security, and adherence to
our project conventions. The spec says [X]. The change should [Y].
Flag any issues as Critical, Required, Optional, or Nit.
```

## Dead Code Hygiene

After any refactoring or implementation change, check for orphaned code:

1. Confirm which code the change made unreachable or unused.
2. In review, list it explicitly and recommend removal without editing. In authorised implementation, remove newly orphaned code that belongs to the change.
3. Report pre-existing or out-of-scope dead code separately. When ownership or whether code is used is uncertain, investigate callers and ask before deleting if uncertainty remains.

```
CODE ORPHANED BY THIS CHANGE:
- formatLegacyDate() in src/utils/date.ts — replaced by formatDate()
- OldTaskCard component in src/components/ — replaced by TaskCard
- LEGACY_API_URL constant in src/config.ts — no remaining references
→ Remove as part of the change after confirming there are no remaining callers.
```

## Review Speed

Slow reviews block entire teams. The cost of context-switching to review is less than the waiting cost imposed on others.

- **Respond promptly** within the review's agreed constraints.
- **Prioritize fast individual responses** over quick final approval. Quick feedback reduces frustration even if multiple rounds are needed
- **Large changes:** Look for an independently verifiable outcome to split off. For an indivisible change, report any specific review gap rather than demanding an arbitrary split.

## Handling Disagreements

When resolving review disputes, apply this hierarchy:

1. **Technical facts and data** override opinions and preferences
2. **Style guides** are the absolute authority on style matters
3. **Software design** must be evaluated on engineering principles, not personal preference
4. **Codebase consistency** is acceptable if it doesn't degrade overall health

**Don't accept "I'll clean it up later."** Require cleanup made necessary by the change. Report surrounding issues separately without expanding the task or automatically filing issues. Refer deliberate debt or a proposed deferral to the user under the root authority; unresolved Critical and Required findings still prevent technical approval.

## Honesty in Review

When reviewing code — whether written by you, another agent, or a human:

- **Don't rubber-stamp.** "LGTM" without evidence of review helps no one.
- **Don't soften real issues.** "This might be a minor concern" when it's a bug that will hit production is dishonest.
- **Quantify only what the evidence supports.** Source and callers may show one extra query per item, but not its latency. Cite matching measurements for observed impact; otherwise describe the potential impact and the next measurement, such as query count and latency under representative load. Use the performance checklist to guide diagnosis, not to mandate fixes. A large row-estimate error does not establish stale statistics, and an unchanged scan node does not disprove a measured improvement. Judge comparative plans and timings under matching conditions and account for write cost when reviewing an index.
- **Push back on approaches with clear problems.** Sycophancy is a failure mode in reviews. If the implementation has issues, say so directly and propose alternatives.
- **Resolve overrides through the right authority.** Check disputed facts against evidence and refer user-owned decisions to the user. The author's disagreement alone does not resolve a finding. Comment on code, not people.

## Dependency Discipline

Part of code review is dependency review:

**Before adding any dependency:**

1. Does the existing stack solve this? (Often it does.)
2. How large is the dependency? (Check bundle impact.)
3. Is it actively maintained? (Check last commit, open issues.)
4. Does it have known vulnerabilities? Identify the installation boundary that owns the lockfile and verify its package manager from project configuration and CI. Use matching advisory evidence for that boundary and resolved lockfile, not an npm audit for a Bun workspace or results from another package boundary.
5. What's the license? (Must be compatible with the project.)

**Rule:** Prefer standard library and existing utilities over new dependencies. Every dependency is a liability.

**Upgrading an existing dependency** is a code change like any other, and the riskiest upgrades are the ones merged in bulk with a message like "bump deps." Review them with the same discipline:

1. **Read the changelog, not just the version number.** Semver is a promise the maintainer may not have kept — a "patch" can carry a behavioral change. For a major bump, read the migration notes and find what breaks.
2. **One dependency per change.** Upgrade and merge them individually (or in small related groups). When a bulk bump breaks the build, you've lost which package did it; a single-package change makes the cause obvious and the revert clean.
3. **Let the tests decide.** The upgrade is verified by a green suite before _and_ after, not by "it installed." If coverage around the dependency's behavior is thin, that gap is the real finding — add a test first.
4. **Mind the transitive graph.** Most installed packages are ones nobody chose directly. Review the lockfile diff, not just `package.json`; a single direct bump can pull in dozens of indirect changes.
5. **Keep the lockfile honest.** Commit it, review its diff, and never hand-edit it. The lockfile is the thing that actually pins what ships.

For advisory triage and supply-chain risk (typosquatting, compromised maintainers), follow [Dependencies and supply chain](../security-and-hardening/SKILL.md#dependencies-and-supply-chain). Separate known advisories, reachability and remedies. A review is not an install or a release and does not authorise a new registry query. Before release, the native advisory audit against each relevant committed lockfile still applies; reuse matching evidence and report missing or blocked evidence as such.

## The Review Checklist

```markdown
## Review: [PR/Change title]

### Context

- [ ] I understand what this change does and why

### Correctness

- [ ] Change matches spec/task requirements
- [ ] Edge cases handled
- [ ] Error paths handled
- [ ] Tests cover the change adequately

### Readability

- [ ] Names are clear and consistent
- [ ] Logic is straightforward
- [ ] No unnecessary complexity

### Architecture

- [ ] Follows existing patterns
- [ ] No unnecessary coupling or dependencies
- [ ] Appropriate abstraction level
- [ ] Refactors reduce complexity rather than relocate it
- [ ] No feature logic in shared modules; structural findings cite a concrete defect, not a line count

### Security

- [ ] No secrets in code
- [ ] Input validated at boundaries
- [ ] No injection vulnerabilities
- [ ] Auth checks in place
- [ ] External data sources treated as untrusted

### Performance

- [ ] No N+1 patterns
- [ ] No unbounded operations
- [ ] Fetches are bounded where collections can grow; pagination is assessed where needed

### Verification

- [ ] Applicable tests, build and manual checks are supported by evidence for this scope and checkpoint
- [ ] Any applicable missing or blocked proof is reported

### Verdict

- [ ] **Approve** — No unresolved Critical or Required findings; required checks and any required independent review are satisfied
- [ ] **Request changes** — Critical or Required findings remain, or required proof or independence is unmet
```

## See Also

- For detailed security review guidance, see `../../references/security-checklist.md`
- For diagnostic prompts, see `../../references/performance-checklist.md`; use `performance-optimization` to assess matching evidence and distinguish findings from possible remedies.

## Common Rationalizations

| Rationalization                                  | Reality                                                                                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "It works, that's good enough"                   | Working code that's unreadable, insecure, or architecturally wrong creates debt that compounds.                                                                               |
| "I wrote it, so I know it's correct"             | Authorship is not evidence. Review the change on its merits and use fresh context when independence is required.                                                              |
| "We'll clean it up later"                        | Require change-related cleanup. Report unrelated issues separately and leave user-owned deferrals to the user.                                                                |
| "AI-generated code is probably fine"             | AI code needs more scrutiny, not less. It's confident and plausible, even when wrong.                                                                                         |
| "The tests pass, so it's good"                   | Tests are necessary but not sufficient. They don't catch architecture problems, security issues, or readability concerns.                                                     |
| "The refactor makes it cleaner"                  | Relocating complexity isn't reducing it. If the reader still holds the same number of concepts, the structure didn't improve — look for the version where branches disappear. |
| "It's only a small addition to this file"        | A small diff can still tangle a new responsibility with an existing flow. Judge the resulting structure, not the count.                                                       |
| "It's just a version bump"                       | A bump is a behavior change you didn't write. Read the changelog; semver doesn't guarantee no breakage.                                                                       |
| "I'll upgrade everything in one PR to save time" | A bulk bump that breaks the build hides which package did it. One dependency per change keeps the cause and the revert clean.                                                 |

## Red Flags

- PRs merged without any review
- Review that only checks if tests pass (ignoring other axes)
- "LGTM" without evidence of actual review
- Security-sensitive changes without security-focused review
- A large change with a specific unreviewed part or distinct outcomes that could be verified separately
- No regression tests with bug fix PRs
- Review comments without severity labels — makes it unclear what's required vs optional
- Deferring change-related cleanup on the author's say-so
- A refactor that moves code around without reducing the number of concepts a reader must hold
- Growth of an already-large file that tangles distinct responsibilities
- New conditionals scattered into unrelated code paths (a missing abstraction)
- A bespoke helper that duplicates an existing canonical one, or feature logic placed in a shared module
- A bulk "bump dependencies" PR with no changelog review and no per-package isolation
- A lockfile change that's hand-edited, uncommitted, or merged without reviewing its diff

## Verification

After review is complete:

- [ ] Critical and Required findings are resolved for technical approval; any unresolved finding remains explicit
- [ ] Applicable checks for the scope and checkpoint are supported by evidence; failed or unavailable required proof is reported as unmet
- [ ] Required independent review is satisfied or reported as unmet, separately from human acceptance
- [ ] The verification story is documented (what changed, evidence inspected, checks run and limitations)
- [ ] Dependency upgrades were reviewed against their changelog, isolated per package, and verified by a green suite with the lockfile diff reviewed

**Presumptive blockers:** surface and propose the simpler design for each of these; escalate to Required only when the change actively makes structure worse: a refactor that relocates complexity instead of reducing it; growth that tangles distinct responsibilities in an already-large file; feature logic added to a shared module; a near-duplicate of an existing canonical helper; a silent fallback that hides an unclear invariant.
