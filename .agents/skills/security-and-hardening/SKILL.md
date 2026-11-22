---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when auditing an input handler for vulnerabilities, when handling user input, authentication, data storage, or external integrations, or when checking a login flow is safe against the OWASP Top Ten. Use when building any feature that accepts untrusted data, manages user sessions or session cookies, or interacts with third-party services. Use when auditing dependencies for known vulnerabilities, triaging package-manager audit findings, or assessing supply-chain risk in a new package. Use when personal data or privacy compliance (GDPR, CCPA) is involved.
---

# Security and Hardening

## Overview

Security-first development practices for web applications. Treat every external input as hostile, every secret as sacred, and every authorization check as mandatory. Security isn't a phase — it's a constraint on every line of code that touches user data, authentication, or external systems.

## When to Use

- Building anything that accepts user input
- Implementing authentication or authorization
- Storing or transmitting sensitive data
- Integrating with external APIs or services
- Adding file uploads, webhooks, or callbacks
- Handling payment or PII data

## Process: Threat Model First

Controls bolted on without a threat model are guesses. Before hardening, spend five minutes thinking like an attacker:

1. **Map the trust boundaries.** Where does untrusted data cross into your system? HTTP requests, form fields, file uploads, webhooks, third-party APIs, message queues, and **LLM output** — plus the local values that look internal because the OS handed them to you: another process's command line or environment, filenames on a shared volume, a path in a job payload. Trust follows who _wrote_ a value, not which channel delivered it. Every boundary is attack surface.
2. **Name the assets.** What's worth stealing or breaking? Credentials, PII, payment data, admin actions, money movement.
3. **Run STRIDE over each boundary** — a quick lens, not a ceremony:

| Threat                     | Ask                                        | Typical mitigation                             |
| -------------------------- | ------------------------------------------ | ---------------------------------------------- |
| **S**poofing               | Can someone impersonate a user/service?    | Authentication, signature verification         |
| **T**ampering              | Can data be altered in transit or at rest? | Integrity checks, parameterized queries, HTTPS |
| **R**epudiation            | Can an action be denied later?             | Audit logging of security events               |
| **I**nformation disclosure | Can data leak?                             | Encryption, field allowlists, generic errors   |
| **D**enial of service      | Can it be overwhelmed?                     | Rate limiting, input size caps, timeouts       |
| **E**levation of privilege | Can a user gain rights they shouldn't?     | Authorization checks, least privilege          |

4. **Write abuse cases next to use cases.** For each feature, ask "how would I misuse this?" For an approved implementation, make a benign check for the applicable abuse case your first test. In a read-only assessment, identify the check and available evidence.

If you can't name the trust boundaries for a feature, you're not ready to secure it. This is OWASP **A06:2025 Insecure Design** — most breaches begin in design, not code.

## The Three-Tier Boundary System

Apply the controls to the selected scope and the trust boundaries that actually exist. In a read-only review, inspect existing evidence and keep any harmless checks within the authorised assignment. Changes require an [approved implementation and testing plan](../../../AGENTS.md#authority). Use synthetic inputs and redacted evidence: CV content, derived filenames and private paths can identify people.

### Always Do (No Exceptions)

- **Validate all external input** at the system boundary (API routes, form handlers)
- **Parameterize all database queries** — never concatenate user input into SQL
- **Encode output** to prevent XSS (use framework auto-escaping, don't bypass it)
- **Use HTTPS** for all external communication
- **Hash passwords** with bcrypt/scrypt/argon2 (never store plaintext)
- **Set security headers** (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- **Use httpOnly, secure, sameSite cookies** for sessions
- **Require a native advisory audit of the committed lockfile before release** for each installation boundary the release involves; report missing or blocked evidence as unmet

### Ask First (Requires Human Approval)

- Adding new authentication flows or changing auth logic
- Storing new categories of sensitive data (PII, payment info) or adding telemetry
- Adding new external service integrations
- Changing CORS configuration
- Adding file upload handlers
- Modifying rate limiting or throttling
- Granting elevated permissions or roles

### Never Do

- **Never commit secrets** to version control (API keys, passwords, tokens)
- **Never log personal data or secrets**, including passwords, tokens, CV content and identifying filenames or paths
- **Never trust client-side validation** as a security boundary
- **Never disable security headers** for convenience
- **Never use `eval()` or `innerHTML`** with user-provided data
- **Never store sessions in client-accessible storage** (localStorage for auth tokens)
- **Never expose stack traces** or internal error details to users

## Hardening Controls

The rules below are the workflow; a concrete implementation of each lives in [references/hardening-patterns.md](references/hardening-patterns.md). Open the section you need when you reach that code, not before.

### Injection, XSS, and access control

- Parameterize every query. Never build SQL, NoSQL, or shell commands from input strings.
- Encode output through the framework's auto-escaping. If raw HTML is unavoidable, sanitize with an allowlist sanitizer first.
- Check **authorisation** on every protected request, not just authentication: the authenticated user must own the specific resource or have permission to access it (A01:2025, IDOR).

Patterns: [Injection](references/hardening-patterns.md#injection), [XSS](references/hardening-patterns.md#cross-site-scripting-xss), [Access control](references/hardening-patterns.md#broken-access-control).

### Authentication and sessions

- Hash passwords with bcrypt (≥12 rounds), scrypt or argon2. Keep the session secret on the server, outside source code and client bundles.
- Use `httpOnly` and `secure` session cookies with a bounded `maxAge` and `sameSite: 'lax'` or `'strict'`. A different setting requires the owner's separate, explicit approval of that specific cookie-policy change. If a flow cannot meet the approved cookie policy, mark the control unmet and refer the policy decision to the owner. Verify request intent on each state-changing route with appropriate CSRF protection independent of SameSite.

Pattern: [Authentication](references/hardening-patterns.md#broken-authentication).

### Headers, CORS, and responses

- Security headers on every response (helmet or the framework equivalent); CSP starts from `default-src 'self'` and is tightened, not loosened.
- For private cross-origin browser access, read the origin allowlist from approved deployment configuration and allow only listed origins. Reserve `*` for intentionally public access without credentials. Omit CORS headers when cross-origin access is not needed.
- Return only fields intended for the recipient. Error bodies are generic; server logs use redacted diagnostics.

Patterns: [Misconfiguration](references/hardening-patterns.md#security-misconfiguration), [Sensitive data exposure](references/hardening-patterns.md#sensitive-data-exposure).

### Input validation and uploads

- Validate at the boundary with a schema: allowlisted shape, lengths, enums and formats. Reject invalid input using the agreed interface; downstream code uses only the parsed, typed value.
- Uploads: allowlist MIME types, cap size, verify content (magic bytes) when it matters. The extension proves nothing.

Patterns: [Schema validation](references/hardening-patterns.md#schema-validation-at-boundaries), [File upload](references/hardening-patterns.md#file-upload-safety).

### Server-side fetches (SSRF)

Any URL the user influences — webhooks, import-from-URL, image proxies, link previews — can be aimed at internal services. Allowlist scheme and host, resolve **all** DNS records and reject any private or reserved address (loopback, link-local `169.254.169.254`, private, unique-local, for IPv4 and IPv6), and forbid redirects. That check still has a DNS-rebinding TOCTOU gap: for high-risk surfaces, pin the resolved IP or put a filtering agent in front.

Pattern: [SSRF](references/hardening-patterns.md#server-side-request-forgery-ssrf).

### Destructive operations on derived paths

A delete, move, or overwrite is only as safe as the value naming its target, and trust follows who _wrote_ that value, not which channel delivered it: another process's command line is as attacker-controlled as a form field. A shape check proves well-formedness, not authorization. Before the call, require all three: the resolved target (symlinks resolved) sits under an **allowlisted root**; it is at least one level **below** that root; and it carries **ownership evidence read before the operation**. On refusal, report the reason without the target or a native error that could reveal it, then stop; never fall back to a broader default path.

Why the check is weaker than it reads (marker self-attestation, check/use races): [Destructive paths](references/hardening-patterns.md#destructive-operations-on-derived-paths). Worked code: `../../references/security-checklist.md`.

### Rate limiting

Limit the API generally and auth endpoints strictly (about 10 attempts per 15 minutes). Once more than one process serves traffic, in-memory counters silently become `max × instances`, or never fire on serverless: back the limiter with a shared store.

Pattern: [Rate limiting](references/hardening-patterns.md#rate-limiting).

### Secrets

Keep secrets in a trusted runtime environment, outside source control and client bundles. Environment values bundled into client code (for example Vite's `VITE_` variables) are public. Commit placeholder values in `.env.example`, ignore real `.env*` files and key material and review staged changes without exposing values. **Assume a secret that reached a remote is compromised.** Escalate promptly to the authorised owner for revocation and rotation before any decision about rewriting history.

Pattern: [Secrets management](references/hardening-patterns.md#secrets-management).

### Dependencies and supply chain

1. **Find the installation boundary and manager.** Use the workspace root that owns the lockfile, or an independent nested project only when it is outside that workspace. Corroborate `packageManager` (when present), the lockfile and CI; stop the affected checks on disagreement or competing lockfiles. Establish the version actually used; changes to it require approval.
2. **Block unreviewed dependency scripts before first execution.** In an assessment, inspect the existing policy and evidence. For an authorised install, bootstrap with scripts disabled or a documented fail-closed policy and inspect the pending script source before execution. Record only approved, minimal policy changes and verify with a clean frozen/immutable install. A frozen lockfile alone does not disable scripts. Never blanket-approve.
3. **Separate advisory, reachability and remedy.** Before release, obtain a native advisory audit against the committed lockfile at each installation boundary the release involves. Reuse valid audit results for the matching boundary and lockfile. Run a new audit only within the authorised scope, including any registry data disclosure; report missing or blocked evidence as unmet. Triage critical/high findings for runtime, build, test and deployment reachability, including dev-only dependencies, and assess fix availability. Read-only triage does not upgrade dependencies, change trust policy or accept a deferral. Never apply forced remediation automatically; review and test approved repairs and record a reason and review date for approved deferrals.
4. **Audits only match known advisories.** They do not catch a newly malicious or typosquatted package (`cross-env` vs `crossenv`). Review new dependencies, lockfile diffs and script-policy changes together: ownership, maintenance, release age, provenance and transitive graph. Verify registry signatures and provenance where supported, using the manager's documented procedure. Reuse valid verification results only for the exact resolved artefacts from the same registry under the same trust policy. Obtain authorisation for any external request and report missing or blocked verification as unmet. Missing signatures or provenance warrant investigation, not a conclusion of compromise (A03:2025, LLM03).

Triage decision tree: [Dependency audit triage](references/hardening-patterns.md#dependency-audit-triage). Manager matrix and install-script gate: `../../references/security-checklist.md`.

### Personal data and privacy

Hardening asks "can an attacker read it?" Privacy asks "should _we_ hold it at all, and for how long?" The cheapest data to protect, breach, and comply over is the data you never collected; treat personal data as a liability to minimize.

- **Classify fields as you add them** (non-personal, PII, sensitive) and handle each class accordingly. You cannot protect, or honor a deletion request for, data you cannot find.
- **Collect only against a stated purpose.** "Might be useful later" is latent breach scope, not a purpose. Keep PII out of telemetry (the `observability-and-instrumentation` skill makes the same point from the ops side).
- **Set retention and deletion up front.** Determine what retention and deletion obligations apply, then verify deletion or expiry across actual stores and copies, including backups, caches, search indexes and analytics copies.
- **Support the data-subject rights your jurisdiction requires** (GDPR, CCPA, and kin): export, correct, delete. Design the schema so a user's data is findable and erasable, not smeared irreversibly across systems.
- **Meet applicable prerequisites before processing.** Determine with the responsible owner whether a formal lawful basis is required given the jurisdiction, role and processing facts. Verify any required basis before processing. Sending personal data to an analytics, ad or LLM vendor is sharing. When consent is required, retain an auditable record showing it was obtained before the processing it covers. Before sharing, verify that any required data-processing agreement is in place and that applicable terms and safeguards are satisfied. Escalate uncertain obligations to the responsible owner for resolution before the affected processing proceeds. A review does not authorise new collection, sharing or consent infrastructure.

Classification table: [Data classification](references/hardening-patterns.md#data-classification). Escalate privacy incidents promptly to the responsible owner to assess whether, when and to whom notification is required. Use `debugging-and-error-recovery` for an authorised postmortem.

### AI / LLM features

Calling an LLM — chatbots, summarizers, agents, RAG — adds a new attack surface; map it to the [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/llm-top-10/):

- **Model output is untrusted input** (LLM05). Never into `eval`, SQL, a shell, `innerHTML`, or a file path; parse defensively, validate against a schema, then encode.
- **Prompts can be hijacked** (LLM01). Untrusted text in the context — a user message, a fetched page, a PDF — can carry instructions. The system prompt is not a security boundary; enforce permissions in code.
- **Keep secrets and other users' data out of the context window; assume the system prompt can be disclosed** (LLM02, LLM07). Scope tool permissions, validate every tool argument and confirm destructive actions (LLM06); cap tokens, request rate and recursion depth (LLM10); partition RAG embeddings per tenant and validate documents before indexing (LLM08).

Pattern: [LLM output handling](references/hardening-patterns.md#llm-output-handling).

## Review Checklist

Use the applicable sections of [the security checklist](../../references/security-checklist.md). Record the scope and distinguish inapplicable controls, missing evidence and failed checks. This skill neither adds a release gate nor waives an existing one.

## Common Rationalizations

| Rationalization                                     | Reality                                                                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "This is an internal tool, security doesn't matter" | Internal tools get compromised. Attackers target the weakest link.                                                                                              |
| "We'll add security later"                          | Security retrofitting is 10x harder than building it in. Add it now.                                                                                            |
| "No one would try to exploit this"                  | Automated scanners will find it. Security by obscurity is not security.                                                                                         |
| "The framework handles security"                    | Frameworks provide tools, not guarantees. You still need to use them correctly.                                                                                 |
| "It's just a prototype"                             | Prototypes become production. Security habits from day one.                                                                                                     |
| "Threat modeling is overkill here"                  | Five minutes of "how would I attack this?" prevents the design flaws no control can patch later.                                                                |
| "It's just LLM output, it's only text"              | That "text" can be a SQL statement, a script tag, or a shell command. Treat it like any untrusted input.                                                        |
| "The audit passed, so the dependency is safe"       | Audits match known advisories. They do not detect a newly malicious package or make unreviewed install scripts safe to execute.                                 |
| "Collect it now, we might need it later"            | Data you don't hold can't be breached, subpoenaed, or mis-deleted. "Might need it" is breach scope, not a purpose.                                              |
| "We'll handle deletion requests manually"           | Manual erasure misses backups, caches, and analytics copies. If the schema can't find a user's data, you can't honor the request — design for it.               |
| "Compliance is legal's problem, not ours"           | Design for the obligations that apply. Establish applicable export, deletion, retention and consent requirements before spreading personal data across systems. |

## Red Flags

- User input passed directly to database queries, shell commands, or HTML rendering
- A delete, move, or overwrite whose target comes from a payload, a config value, or another process's command line, guarded only by a shape check on the path
- Secrets in source code or commit history
- Protected API endpoints without authentication or authorisation checks
- Private cross-origin browser access without an explicit origin policy
- No rate limiting on authentication endpoints, or an in-memory limiter in front of more than one instance
- Stack traces or internal errors exposed to users
- Critical dependency advisories with reachable or unresolved impact, competing lockfiles at one installation boundary, non-reproducible installs or blanket-approved scripts
- Server fetches user-supplied URLs without an allowlist (SSRF)
- LLM/model output passed into a query, the DOM, a shell, or `eval`
- Secrets, personal data (including ordinary first-party personal data) or other users' data placed inside an LLM context window; public instructions alone are not a red flag
- Personal data collected without a stated purpose or without defined retention and deletion for actual copies
- Personal data processed while the need for a formal lawful basis remains unresolved or before applicable prerequisites are met: verification of a valid basis when required, auditable evidence of prior consent when required and fulfilment of applicable third-party terms and safeguards
- "Delete my account" that only flips a flag while the personal data lingers in stores and backups

## Verification

After implementing security-relevant code, verify the applicable items under [Verification](../../../docs/reference/verification.md). In a read-only assessment, record the evidence available for those items and report any required check that failed or could not be evidenced.

- [ ] At affected installation boundaries, CI preserves the authoritative lockfile and blocks unreviewed dependency scripts. Before release, each installation boundary the release involves has valid native advisory audit results for its committed lockfile. Verify there are no unmitigated reachable critical/high findings and meet any stricter release gate. Missing or blocked audit evidence remains unmet.
- [ ] Required evidence supports the outcome: no secret exposure detected within the examined source and history scope. Report the scope and limits using only redacted evidence. Confirmed exposure fails the check and must be escalated; missing required evidence leaves the check unmet. A filename-only heuristic does not establish absence.
- [ ] All user input validated at system boundaries
- [ ] Destructive filesystem operations resolve symlinks, then verify allowlisted root, minimum depth, and ownership before running
- [ ] Authentication and authorization checked on every protected endpoint
- [ ] Security headers present in response (check with browser DevTools)
- [ ] Error responses don't expose internal details
- [ ] Rate limiting active on auth endpoints, backed by a shared store when more than one instance serves traffic
- [ ] Server-side URL fetches validated against an allowlist (no SSRF)
- [ ] LLM/model output validated and encoded before use (if AI features present)
- [ ] Personal data is classified and limited to a stated purpose; applicable retention and deletion are verified across actual stores and copies
- [ ] Applicable data-subject rights, such as deletion and export, work end to end
