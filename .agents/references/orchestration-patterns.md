# Orchestration Patterns

Reference catalogue of agent orchestration patterns this repo endorses, plus anti-patterns to avoid. Read this before choosing or carrying out delegation, or defining a procedure or persona that coordinates agents.

Apply mandatory skill procedures within the [root authority](../../AGENTS.md#authority) and [workflow foundation](../skills/using-agent-skills/SKILL.md#overview). The working agent performs the authorised task and integrates delegated results; a specialist receives a bounded assignment, not responsibility for progressing the project lifecycle. A persona describes a perspective, not proof of an available runtime agent.

---

## Delegation contract

Give each specialist:

- The authorised scope, permitted actions and expected result, distinguishing investigation or review from editing.
- The relevant project instructions, applicable procedures and requirements, with references to their authoritative sources.
- The artefact or repository state to examine, dependencies and ownership boundaries.
- The evidence needed to assess the result, including source locations, actual check outcomes and unresolved questions.

For parallel edits, establish non-overlapping ownership and shared contracts before dispatch. Different files alone do not establish independence. The working agent owns integration and ensures that verification covers the integrated result.

Give concurrent browser work separate pages and output paths; sequence conflicting operations on a shared page or mutable tool session. Separate agent contexts do not establish isolation of a shared MCP connection or its resources.

For independent review, supply the artefact, contract and relevant evidence without the author's preferred conclusion. Select the perspectives the work needs rather than enlisting every available persona.

Specialists return findings with supporting evidence, any changes made, actual verification results and unresolved limitations or decisions. The working agent checks findings against the source and resolves conflicts through evidence, not vote counts. If the examined state has changed, verify the affected claims before relying on them. Failed or incomplete work remains visible under [Verification](../../docs/reference/verification.md); a successful agent return is not proof of completion.

Keep summaries concise but traceable to the underlying evidence and approval records. A summary does not create authority. For session handoffs, reuse [Restartable Session Boundaries](../skills/context-engineering/SKILL.md#restartable-session-boundaries), not a second handoff checklist here.

---

## Endorsed patterns

### 1. Direct work (no delegation)

The working agent handles the authorised task directly. This is the default unless independent scrutiny, context isolation or substantial separable work justifies delegation. One task may involve several artefacts, perspectives or skills.

**Examples of specialist perspectives, not runtime invocation syntax:**

- "Review this PR" → `code-reviewer`
- "Find security issues in `auth.ts`" → `security-auditor`
- "What tests are missing for the checkout flow?" → `test-engineer`

**Cost:** no additional agent context or merge step. The baseline you should always compare delegated patterns against.

---

### 2. Saved procedure

A saved prompt packages a recurring procedure with the applicable skills. Saves the user from re-explaining the workflow every time.

**Use when:** the same procedure happens repeatedly with the same setup.

**Example:** a saved review prompt identifies the artefact, contract and applicable review procedure.

Packaging a procedure does not itself create another agent or authorise another lifecycle phase. Check the active harness when invocation support matters; this reference does not establish installed commands or agent types.

**Anti-signal:** a wrapper that only chooses another persona and paraphrases its response adds a routing layer rather than useful work. See anti-pattern A.

---

### 3. Parallel fan-out with merge

Independent assignments run concurrently. The working agent synthesises findings or integrates owned changes. Reviewers may examine the same artefact; implementers may work on separable parts of an authorised change.

**Use when:** independent scrutiny, context isolation or substantial separable work justifies the coordination overhead.

**Validation checklist before adopting this pattern:**

- [ ] Can the assignments run concurrently without unresolved ordering dependencies or conflicting ownership?
- [ ] Does each assignment have a concrete purpose under the delegation contract?
- [ ] Can the working agent assess and integrate the results without losing relevant evidence?

Different reviewers may examine the same kind of issue independently. Latency savings are a possible benefit, not a requirement or guarantee. If a prerequisite fails, resolve it, sequence the dependent work or work directly; preserve any required independent scrutiny.

**Cost:** additional agent contexts and integration work. Parallelism does not guarantee better findings or faster completion.

---

### 4. Human-directed lifecycle

Follow [root authority](../../AGENTS.md#authority) for lifecycle progression. An investigation-only request ends with findings. An approved plan covering implementation, verification and preparation for local review permits those activities without fresh per-phase approval.

**Use when:** work has dependencies and later steps need earlier results. Sequence that work within the authorised scope rather than introducing a lifecycle-manager agent.

Use [Testing](../../docs/reference/testing.md) inside each behaviour-changing slice, not a build-then-test pipeline. Use [Verification](../../docs/reference/verification.md) for completion evidence and review readiness. A specialist verdict or merged report remains a recommendation, not publication or merge authority.

Changing phases or applying another skill does not itself require a new agent or session. For the rejected coordinator architecture and its risks, see anti-pattern C.

---

### 5. Research isolation (context preservation)

For context-heavy investigation, use a research specialist when focused findings will preserve more useful main-session context than the handoff consumes. Return a concise, evidence-backed digest under the delegation contract, not an unsourced conclusion.

**Use when:**

- The main session needs to stay focused on a downstream task
- The investigation result is much smaller than the input it consumes
- Context isolation offers a concrete benefit beyond targeted inspection in the main session

**Examples:** "Find every call site of this deprecated API across the monorepo," "Summarise what these 30 ADRs say about caching."

**Cost:** an isolated agent context and assessment of its findings. Large source volume alone does not make delegation worthwhile.

---

## Worked example: competing-hypothesis debugging

Independent review assesses an artefact against a contract. Competing-hypothesis debugging seeks observations that distinguish possible explanations.

### The scenario

> _Checkout occasionally hangs for ~30 seconds before completing. It happens roughly once every 50 sessions. No errors in logs. Started after last week's release._

Plausible causes to investigate; several may contribute:

1. A race condition in the new payment-confirmation flow
2. An auth check that occasionally falls through to a slow synchronous network call
3. A missing index on a query that scales with cart size
4. A flaky third-party API where the SDK retries silently before timing out

### What happens

1. Identify observations or checks that would distinguish the explanations, including evidence that could contradict each one.
2. Investigate directly or delegate bounded, separable questions under the delegation contract. Do not prescribe a fixed team or enlist every persona.
3. Compare findings against the same relevant artefact state. Initial independent reports can be challenged afterwards, but shared reasoning is collaboration, not additional independent corroboration.
4. Resolve disagreements with targeted evidence. Direct peer messaging is optional: the working agent can reconcile reports and arrange authorised follow-up investigation.
5. Present the supported diagnosis, evidence, surviving alternatives and limitations. Agreement between investigators is not proof; if evidence is insufficient, report the diagnosis as unresolved.

Checks and experiments stay within the authorised scope. A diagnosis does not itself authorise implementing a fix.

### Cost expectation

Use multiple investigators when independent scrutiny or substantial separable investigation earns the coordination cost. Ordinary debugging can remain direct; neither parallel reports nor discussion guarantees a correct conclusion.

---

## Anti-patterns

### A. Router persona ("meta-orchestrator")

A persona whose job is to decide which other persona to call.

**Why it fails:**

- Pure routing layer with no domain value
- Adds paraphrasing hops that can lose nuance and consume context
- Duplicates procedure selection that the working agent can perform directly

**What to do instead:** perform the authorised task directly or use a saved procedure. Choosing an applicable skill does not require a router agent.

---

### B. Persona that calls another persona

A `code-reviewer` that internally invokes `security-auditor` when it sees auth code.

**Why it fails:**

- Expands a specialist assignment into a delegation chain
- Adds handoff and reconciliation work outside the assigned boundary
- Obscures ownership, applicable instructions and cost

**What to do instead:** delegated personas do not invoke other personas. Report the need and supporting evidence to the working agent, which arranges any authorised follow-up or brings uncovered user-owned decisions back to the user. A mandatory step that cannot run within the assignment remains unmet; do not silently skip it or substitute self-review for required independent review.

---

### C. Autonomous lifecycle coordinator

An additional agent whose role is to route specification, planning, implementation, review and shipping between phase-specific agents.

**Why it is rejected:** [root authority](../../AGENTS.md#authority) prohibits this architecture. Approval-gate compliance alone does not make it an allowed role. Repeated handoffs can lose nuance, obscure human checkpoints and add coordination cost; these are risks, not inevitable outcomes or a fixed token multiplier.

**What to do instead:** use the human-directed progression in pattern 4. The working agent completes authorised work and arranges bounded delegation, not a separate lifecycle-management layer.

---

### D. Deep persona trees

A working agent delegates to a coordinator that delegates to another coordinator before reaching a specialist.

**Why it fails:**

- Routing layers add latency and tokens without delivering the assigned task
- Debugging becomes a multi-level investigation
- Leaf specialists can lose context through successive summaries

**What to do instead:** keep delegation one level deep: the working agent dispatches specialists and integrates their results.

---

## Decision flow

1. Establish the authorised outcome. Use direct work by default; consider delegation for independent scrutiny, context isolation or substantial separable work.
2. Choose the applicable delegation pattern:
   - Context-heavy investigation with compact, traceable findings → research isolation.
   - Independent assignments with clear ownership and useful isolation or separation → parallel fan-out with merge.
   - Competing explanations → the debugging example, using direct or delegated investigation as justified.
   - Ordering dependencies → sequence the work within the authorised scope; do not introduce a lifecycle coordinator.
3. If a procedure recurs, consider saving it. Recurrence justifies packaging, not delegation.

Patterns can combine. Apply the delegation contract and human-directed progression throughout; if a prerequisite is missing, resolve it or report the blocked requirement rather than disguising it as completion.

---

## When to add a new pattern to this catalogue

Add a new entry only after:

1. You've used the pattern at least twice in real work
2. You can name a concrete artefact in this repo that demonstrates it
3. You can explain why an existing pattern wouldn't have worked
4. You can describe its anti-pattern shadow (what people will mistakenly build instead)

These are criteria for adopting standing guidance, not a ban on a first authorised experiment. Premature catalogue entries become aspirational documentation that no one follows.
