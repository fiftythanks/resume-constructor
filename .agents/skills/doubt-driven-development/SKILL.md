---
name: doubt-driven-development
description: Subjects every non-trivial decision to a fresh-context adversarial review before it stands. Use when you want every assumption cross-examined before proceeding, when stress-testing a plan for hidden failure modes, when correctness matters more than speed, when working in unfamiliar code, when stakes are high (production auth, security-sensitive logic, a high-stakes migration, irreversible operations) or any time a confident output would be cheaper to verify now than to debug later.
---

# Doubt-Driven Development

## Overview

A confident answer is not a correct one. Long sessions accumulate context that quietly turns assumptions into "facts" without anyone noticing. Doubt-driven development is the discipline of materialising a fresh-context reviewer — biased to **disprove**, not approve — before any non-trivial output stands.

This is not `/project-review`. `/project-review` is a verdict on a finished artefact. This is an in-flight posture: non-trivial decisions get cross-examined while course-correction is still cheap.

## When to Use

A decision is **non-trivial** when at least one of these is true:

- It introduces or modifies branching logic
- It crosses a module or service boundary
- It asserts a property the type system or compiler cannot verify (thread safety, idempotence, ordering, invariants)
- Its correctness depends on context the future reader cannot see
- Its blast radius is irreversible (production deploy, data migration, public API change)

Apply the skill when:

- About to make an architectural decision under uncertainty
- About to commit non-trivial code
- About to claim a non-obvious fact ("this is safe", "this scales", "this matches the spec")
- Working in code you don't fully understand

**When NOT to use:**

- Mechanical operations (renaming, formatting, file moves)
- Following a clear, unambiguous user instruction
- Reading or summarising existing code
- One-line changes with obvious correctness
- Pure tooling operations (running tests, listing files)
- The user has explicitly authorised omitting this challenge without waiving other applicable verification or review gates

If you doubt every keystroke, you ship nothing. The skill applies only to non-trivial decisions as defined above.

## Loading Constraints

The working agent runs this cycle under [Orchestration patterns](../../references/orchestration-patterns.md). A delegated specialist does not spawn another reviewer or offer a cross-model run on its own; report the need and any unmet independent pass to the working agent.

If the working agent cannot arrange a required fresh-context review, record it as unmet. Optional self-reflection may reveal issues, but is not the DOUBT pass and does not complete the cycle.

## The Process

Copy this checklist when applying the skill:

```
Doubt cycle:
- [ ] Step 1: CLAIM — wrote the claim + why-it-matters
- [ ] Step 2: EXTRACT — isolated artifact + contract, stripped reasoning
- [ ] Step 3: DOUBT — ran a fresh-context adversarial review, or recorded why it remains unmet
- [ ] Step 4: RECONCILE — classified every finding against the artifact text
- [ ] Step 5: STOP — recorded why the loop stopped and which obligations remain unmet
```

### Step 1: CLAIM — Surface what stands

Name the decision in two or three lines:

```
CLAIM: "The new caching layer is thread-safe under the
        read-heavy workload described in the spec."
WHY THIS MATTERS: a race here corrupts user data and is
                  hard to detect in QA.
```

If you can't write the claim that compactly, you have a vibe, not a decision. Surface it before scrutinising it.

### Step 2: EXTRACT — Smallest reviewable unit

A fresh-context reviewer needs the **artefact** and the **contract**, not the journey.

- Code: the diff or the function — not the whole file
- Decision: the proposal in 3–5 sentences plus the constraints it has to satisfy
- Assertion: the claim plus the evidence that supposedly supports it (kept distinct from the Step 1 CLAIM block, which is the orchestrator's hypothesis under scrutiny)

Strip your reasoning. If you hand over conclusions, you'll get back validation of your conclusions. The unit must be small enough that a reviewer can hold it in mind in one read — if it's a 500-line PR, decompose first.

Strip reasoning, not evidence: if a caller, guard or test contradicts the claim, include it in the unit.

### Step 3: DOUBT — Invoke the fresh-context reviewer

The reviewer's prompt **must be adversarial**. Framing decides the answer.

```
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident. Look for:
- Unstated assumptions
- Edge cases not handled
- Hidden coupling or shared state
- Ways the contract could be violated
- Existing conventions this might break
- Failure modes under unexpected input

Do NOT validate. Do NOT summarize. Find issues, or state
explicitly that you cannot find any after thorough examination.

ARTIFACT: <paste artifact>
CONTRACT: <paste contract>
```

**Pass ARTIFACT + CONTRACT, including relevant evidence, not the CLAIM or your reasoning.** Include applicable project instructions and evidence that could disconfirm the claim. The reviewer must independently determine whether the artefact satisfies the contract.

Use an available fresh-context reviewer through OMP's actual task interface. Freshness comes from the assignment and context supplied, not authorship or model choice. Give a bounded read-only assignment: fresh context does not isolate the filesystem or shared tools. If the required independent pass cannot run, keep it unmet rather than simulating it.

**The adversarial prompt above takes precedence over a persona's default response shape.** Use the prompt verbatim and require issues only or an explicit statement that none were found. If a persona cannot honour that format, use an available fresh-context reviewer without that persona.

#### Cross-model escalation

A reviewer with a different model architecture may expose blind spots shared by the original model. Offering that second opinion is part of the interactive doubt cycle, not a substitute for arranging the required independent pass.

**Interactive sessions: always offer. Never silently skip.**

**Step 1: Ask the user**

Before RECONCILE, report the result or unavailability of the fresh-context pass and offer a cross-model review:

> _"Would you like a cross-model opinion? Options: Gemini CLI or Codex CLI if the installed version supports a read-only run, manual external review (you paste it elsewhere) or skip."_

This question is mandatory in every interactive doubt cycle — even on artefacts that feel low-stakes. The user — not the agent — decides whether the cost is worth it. The agent's job is to surface the choice.

**Step 2: If the user picks a CLI — verify, then invoke**

1. Check that the selected binary is on `PATH` and responds to a local version or help check before sending data.
2. Verify the installed version's exact syntax, non-interactive stdin transport and read-only protections. Present an exact route only if those protections are supported and disclosure is authorised. An installed version with no safe route is unavailable; do not fall back to writable execution.
3. Obtain explicit authorisation for this invocation, including the exact command and flags, authentication prerequisites, destination and disclosure of the selected inputs. Confirm again on every run. Choosing a CLI or approving a previous run is not permission to execute this one.
4. Send only the adversarial prompt, ARTIFACT and CONTRACT, with authorised evidence and no CLAIM or session context. Feed the prompt as data through stdin, for example by redirecting from an authorised prompt file. Never interpolate artefact text into a shell argument or command.
5. Take the actual output into Step 4 (RECONCILE). Version, help and stdin checks establish capabilities, not a completed review.

Read-only protections limit workspace writes; they do not make disclosure safe. For manual review, give the user a brief suitable for them to share and wait for the returned findings, or for the user to choose another option. Treat the missing pass as unmet until matching evidence of the independent review is available.

**Step 3: If the CLI is unavailable or fails**

Report what failed and offer manual review, another supported tool or skip. Do not silently drop cross-model or imply that any unavailable review happened.

**Step 4: If the user skips**

Acknowledge the skip and reconcile only the findings actually available. A cross-model skip does not satisfy an unmet independent pass.

**Non-interactive contexts** (CI, `/loop`, autonomous-loop, scheduled runs):

- Cross-model is **skipped**, and the skip must be **announced** in the output: _"Cross-model skipped: non-interactive context."_
- **Never invoke an external CLI review without explicit user authorisation for that run.**

Cross-model adds cost, latency and tool fragility. The agent surfaces the choice every cycle; the user decides whether this artefact warrants it.

### Step 4: RECONCILE — Fold findings back

The working agent assesses findings against the selected artefact and contract. Separate the reviewer's evidence (for example, a source location or matching check result) from its conclusion. Verify the evidence against the relevant sources before accepting or rejecting the finding. A valid finding does not authorise a change.

For each finding, classify in this **precedence order** (first matching class wins):

1. **Contract misread** — the supplied CONTRACT was unclear or incomplete. Clarify it from governing sources, without inventing requirements, and re-classify on the next cycle.
2. **Valid + actionable** — substantiate factual objections: use version-matched official evidence for API semantics and local source, callers or checks for actual behaviour. Assess design judgements against the approved contract rather than treating documentation as a design verdict. Make a correction and re-loop only within the authorised plan; otherwise bring the decision to the user.
3. **Valid trade-off** — document the real issue and the cost of accepting or fixing it. If the approved plan doesn't settle the trade-off, ask the user before accepting it or changing the artefact.
4. **Noise** — reviewer flagged something that's actually correct under context the reviewer didn't have. Note it, move on and ask: would adding that context to the contract have prevented the false flag?

A fresh reviewer can be wrong because it lacks context. Don't defer just because it's "fresh."

### Step 5: STOP — Bounded loop, not recursion

Stop when:

- A review returns no issues or only trivial or already-considered findings, **or**
- 3 cycles completed (escalate to the user, don't grind a fourth alone), **or**
- The user explicitly stops the loop

If after 3 cycles the reviewer still surfaces substantive issues, the artefact may not be ready. Surface this to the user — three unresolved cycles is information about the artefact, not a reason to keep looping.

For an oversized artefact, return to Step 2 and identify independently reviewable units, not another run on the same unchanged artefact. Do not lift the bound. Stopping the loop neither clears unmet checks nor authorises hand-off, merge or publication.

## Common Rationalisations

| Rationalisation                                      | Reality                                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "I'm confident, skip the doubt step"                 | Confidence correlates poorly with correctness on novel problems. Moments of certainty are exactly when blind spots hide.                                                                                                                                      |
| "Spawning a reviewer is expensive"                   | Debugging a wrong commit in production is more expensive. The check is bounded; the bug isn't.                                                                                                                                                                |
| "The reviewer will just nitpick"                     | Only if unscoped. Constrain the prompt to "issues that would make this fail under the contract."                                                                                                                                                              |
| "I'll do doubt at the end with `/project-review`"    | Doubt-driven challenges in-flight decisions. It does not replace the applicable independent review of a finished artefact.                                                                                                                                    |
| "If I doubt every step I'll never ship"              | The skill applies to non-trivial decisions, not every keystroke. Re-read "When NOT to Use."                                                                                                                                                                   |
| "Two opinions are always better than one"            | Not when the second has less context and produces noise. Reconcile, don't defer.                                                                                                                                                                              |
| "The reviewer disagreed so I was wrong"              | The reviewer lacks your context — disagreement is information, not verdict. Re-read the artefact, classify the finding and then decide.                                                                                                                       |
| "Cross-model is always better"                       | Cross-model catches blind spots a single model shares with itself, but it adds cost and tool fragility. Offer it every interactive doubt cycle — the user decides whether the artefact warrants it. The agent's job is to surface the choice, not to gate it. |
| "User said yes once, so I can keep invoking the CLI" | Each review invocation needs explicit authorisation for the exact command and disclosure, even if the tool has been approved before.                                                                                                                          |

## Red Flags

- Spawning a fresh-context reviewer for a one-line rename or formatting change
- Treating reviewer output as authoritative without re-reading the artefact text
- Looping >3 cycles without escalating to the user
- Prompting the reviewer with "is this good?" instead of "find issues"
- Skipping doubt under time pressure on a high-stakes decision
- Re-spawning fresh-context on an unchanged artefact (you'll get the same findings; you're stalling)
- **Doubt theatre (checkable signal)**: across 2 or more cycles where the reviewer surfaced substantive findings, zero findings were classified as actionable. You are validating, not doubting. Stop and escalate.
- Doubting only after committing — that's `/project-review`, not doubt-driven development
- Running an external CLI review without confirming the installed tool's exact read-only route and getting explicit per-run authorisation for the command and disclosure
- **Silently skipping cross-model in an interactive doubt cycle.** Even when not recommending it, the offer must be visible. Skipping is fine; silent skipping is not.
- Falling back silently when an external CLI errors or is missing — surface the failure and let the user redirect
- Stripping the contract from the reviewer's input
- Passing the CLAIM to the reviewer (biases toward agreement)

## Interaction with Other Skills

- **`code-review-and-quality` and `/project-review`**: review assesses the selected artefact; doubt-driven challenges in-flight decisions. It does not replace required pre-hand-off independence.
- **`source-driven-development`**: verify facts about framework APIs against official evidence for the relevant version; assess how this artefact uses them against local evidence and the approved contract.
- **`test-driven-development`**: TDD's RED step is a disproof attempt. A test that fails for the intended reason satisfies the in-flight challenge for that behavioural claim, not for other claims and not the required independent pre-hand-off review.
- **`debugging-and-error-recovery`**: when the reviewer surfaces a real failure mode, use the debugging skill to localise it. Implement a fix only within the authorised plan.
- **[Orchestration patterns](../../references/orchestration-patterns.md)**: the working agent arranges independent review. Delegated specialists report needed follow-up without nested dispatch.

## Verification

After applying doubt-driven development:

- [ ] Every non-trivial decision (per the definition above) was named explicitly as a CLAIM before standing
- [ ] Each applicable non-trivial decision has a fresh-context challenge or is reported unmet; TDD RED satisfies only the in-flight challenge for the behaviour it tests
- [ ] The reviewer received ARTIFACT + CONTRACT and relevant evidence, not the CLAIM or your reasoning
- [ ] The reviewer's prompt was adversarial ("find issues"), not validating ("is it good")
- [ ] Findings were classified against the artefact and contract, with supporting evidence checked separately from the reviewer's conclusions
- [ ] The reason for stopping and remaining obligations are recorded; stopping did not grant readiness or publication authority
- [ ] In each interactive doubt cycle, cross-model was explicitly offered and the user's choice or unavailable review was reported
- [ ] In non-interactive mode, cross-model was skipped and the skip was announced
- [ ] Every external CLI review used a verified read-only stdin route for the installed version, with explicit per-run authorisation for the exact invocation and disclosure
