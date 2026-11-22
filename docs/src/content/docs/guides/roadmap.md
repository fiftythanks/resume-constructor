---
title: Project Roadmap & Technical Decisions
description: Backlog of proposed changes and open questions for Resume Constructor.
---

This roadmap collects open tasks, ideas and historical notes from the project specification, internal task logs and source annotations (`TODO:`, `FIXME:`, `DILEMMA:`). Items are proposals for discussion, not approved requirements or implementation plans. Priorities, designs and cited locations need reassessment before work begins. See the [product reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/product.md), [styling reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/styling.md) and [accessibility reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/accessibility.md).

---

## 1. Macro Responsive Scaling Strategy

One proposed direction adapts the mobile-first single-column layout into a multi-viewport workspace. The breakpoint, interaction design and implementation require approval.

### Desktop & Tablet Shell Adaptation

- **Hybrid CSS Architecture:** Viewport-level layout belongs in `AppLayout`, while component size adaptation uses ancestor container queries. Pointer, hover and user-preference media queries remain distinct from viewport layout.
- **Unified Sidebar:** A permanent left sidebar at `768px` is a proposed breakpoint and design, not an approved requirement.
- **ARIA Synchronisation:** How a wider-screen navigation state is exposed, including whether `aria-expanded` applies, requires interaction and accessibility design.
- **Dual-Pane Workspace:** A persistent live preview beside the editor on wider screens, with a modal on mobile, is a proposed layout.
- **Skip Links:** Consider keyboard skip links to the active form editor as part of the approved navigation design.

### Pure JSX Live Preview (Desktop/Tablet) & Real PDF Parity

- **DOM Preview:** A pure JSX live preview on wider viewports is one possible approach to typing feedback. Compare performance and fidelity with alternatives rather than assuming an unmeasured cost.
- **Shared Primitives:** Universal shared layout primitives are a proposal, not a guarantee of pixel-level parity. The [product reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/product.md) defines the required preview/export correspondence.
- **Pre-Download Inspection:** A desktop toggle to the existing PDF modal pipeline is another design proposal, subject to approval and validation.
- **Resize Handling:** Evaluate container queries or `ResizeObserver` where appropriate rather than assuming they replace every resize listener.

---

## 2. Core Fixes & Stability

### DOM Attachment & `isConnected` Guards

- **Concern:** Detached focus targets or rendering nodes can cause focus or layout problems in asynchronous flows.
- **Candidate Approach:** Investigate attachment checks at the affected boundaries. Blanket guards are not an approved fix; establish the intended behaviour and test each case.
- **Affected Locations:**
  - `src/hooks/useLastComponentBeforeTabpanel.ts:87, 110`: Refocusing captured `relatedTarget` without verifying `lastComponent.current.isConnected` risks dropping focus to `document.body` if the element was detached or re-rendered.
  - `src/components/Preview/Preview.tsx`: Asynchronous PDF rendering and text layer pipelines use `canvasNode.isConnected` and `textLayerNode.isConnected` checks; alternative resize handling remains a proposal.
  - `src/components/AppLayout/Sidebar/Toolbar/Toolbar.tsx:65, 118`: Toolbar arrow navigation and preview modal close handler invoke `.focus()` without checking whether target buttons remain connected.
  - `src/components/AppLayout/Sidebar/Sidebar.tsx:105`: Sidebar toggle keyup handler invokes `.focus()` without verifying `navbarToggle.current.isConnected`.
  - `src/App/App.tsx:211`: `focusSection` computes tabbable elements and invokes `.focus()` without checking `isConnected` on the section container or the first tabbable target.

### Ref-Based Focus Management Migration

- **Concern:** Direct DOM lookups, non-null assertions and focus immediately after state updates may be brittle.
- **Candidate Approach:** Evaluate refs, explicit handling of missing targets and timing of focus transitions for each interaction. A blanket conversion to optional chaining or connection checks is not an approved fix and could hide errors.
- **Affected Locations:**
  - `src/components/AddSections/AddSections.tsx:70–76`: Uses `document.getElementById(...)!.focus()` with non-null assertions to navigate between add buttons instead of managing button refs.
  - `src/components/AppLayout/Sidebar/Navbar/Navbar.tsx:152–162, 205–216, 283–312, 338–356, 358–383, 403–413, 425–427`: Navbar reordering, deletion and arrow navigation handlers bypass `tabRefs` with raw `document.getElementById(...)!.focus()` calls and non-null assertions across tabs, delete triggers and action buttons.
  - `src/components/BulletPoints/BulletPoints.tsx:200–214`: List item deletion uses raw DOM lookups with non-null assertions to focus sibling delete buttons or add buttons.
  - `src/pages/Education/Education.tsx:51`: `addDegree` invokes `document.getElementById('university-name')?.focus()` synchronously after state dispatch, bypassing refs without waiting for reconciliation.
  - `src/pages/Experience/Experience.tsx:51`: `addJob` invokes `document.getElementById('company-name')?.focus()` synchronously after state dispatch, bypassing refs without waiting for reconciliation.
  - `src/pages/Projects/Projects.tsx:53`: `addProject` invokes `document.getElementById('project-name')?.focus()` synchronously after state dispatch, bypassing refs without waiting for reconciliation.

### Dialog Lifecycle & Portal Hardening

- **Concern:** Native dialog lifecycle and portal root availability need careful handling when state and attachment change.
- **Candidate Approach:** Investigate dialog state and mounting at the relevant boundaries; choose a tested approach rather than applying blanket attachment guards.
- **Affected Locations:**
  - `src/components/Popup/Popup.tsx:46`: `rootRef` initialised via `document.getElementById('popup-root')!` with unsafe non-null assertion.
  - `src/components/Popup/Popup.tsx:52–58`: Direct `showModal()` and `close()` invocations in `useEffect` without checking `node.isConnected` or `node.open`.
  - `src/components/Preview/Preview.tsx`: Handled via controlled `onClose` callback in `Preview`; legacy direct DOM calls removed.

### Document Rendering Parity & Rebuild (Completed)

- **Interactive Text Layer:** Mounted an invisible DOM text layer overlay (`pdfjsLib.TextLayer`) directly above the high-DPI canvas to enable selectable, searchable text with `--scale-factor` synchronisation.
- **Personalised Resume Filename:** Formatted downloadable PDF file names using `getResumePdfFileName` to sanitise the applicant's name and produce files like `"john_doe_resume.pdf"`.
- **Link Presence Checks:** Replaced `activeSectionIds` checks in `ResumeDocument` with content-based checks so empty sections do not render orphaned delimiters.
- **Single Contact Item Display:** Resolved header layout bug where email failed to display when no custom links were present.
- **Multi-Page Page Breaks:** Configured card wrapping with `wrap={false}` in `@react-pdf/renderer` to keep entries together where possible.
- **PDF Blob Race Condition:** Added task cancellation and worker asset caching to address blob URL errors during rapid updates.
- **Sources:** `src/components/Preview/ResumeDocument.tsx`, `src/components/Preview/Preview.tsx`, `src/components/Preview/getResumePdfFileName.ts`

---

## 3. Persistence & State Architecture

### Local Storage Synchronisation

- **Current State:** Resume data is stored solely in React memory. Accidental tab closures or browser restarts result in complete data loss.
- **Planned Evolution:** Add a debounced `localStorage` synchronisation layer in `src/App/App.tsx` with automatic draft recovery and snapshot history.
- **Source:** `src/App/App.tsx:32`

### Possible Decomposition of `useAppState`

- **Current Context:** `useAppState.ts` combines section topology, navbar interaction mode and screen reader live announcements. Changes to its state flow should be evaluated against observed behaviour and measured performance rather than assumed render costs.
- **Candidate Evolution:** The following event-driven announcements and hook decomposition are proposals requiring design approval, not approved work:
  1. **Event-Driven Live Announcements:** Consider triggering screen reader messages inside user interaction callbacks (`openSection`, `addSections`, `deleteSections`, `reorderSections` and `toggleEditorMode`).
  2. **Colocate Navbar Mode:** Consider placing `editorMode` closer to `Navbar` or `AppLayout`.
  3. **Decompose Responsibilities:** Consider splitting the hook into focused utilities:
     - `useSectionsState`: Active section ordering, tab switching and undeletable collections.
     - `useUiState`: Ephemeral navbar drawer toggles and editor mode states.
     - `useScreenReaderAnnouncement`: Standalone imperative announcement dispatcher.
- **Sources:** `src/hooks/useAppState.ts:9, 41, 74, 145`

### Centralised Undeletable & Undraggable Collections

- **Current State:** Section deletion checks hardcode `sectionId !== 'personal'`.
- **Planned Evolution:** Define a centralised Set of immutable section IDs to ensure consistent rules across drag-and-drop and removal actions.
- **Sources:** `src/hooks/useAppState.ts:208, 233`

### Action Confirmation Dialogs

- **Current State:** Clicking "Clear All" or "Fill All" instantly overwrites all form entries without confirmation.
- **Planned Evolution:** Introduce confirmation prompts warning users of potential data loss before applying destructive actions.
- **Sources:** `src/components/AppLayout/Sidebar/Toolbar/Toolbar.tsx:147, 161`

---

## 4. Domain Model & Form Simplification

### Semantic Fieldset Grouping

- **Current State:** Degree, Job and Project cards use generic `<div>` wrappers.
- **Planned Evolution:** Refactor each record into a semantic HTML `<fieldset>` with an accessible `<legend>` (e.g. `<legend>Job 1</legend>`), establishing proper form hierarchies.
- **Sources:** `src/pages/Education/Degree.tsx:15`, `src/pages/Experience/Job.tsx:15`, `src/pages/Projects/Project.tsx:15, 94`

### Merging Personal Details & Links

- **Architectural Dilemma:** Contact email and social links appear on the same visual line in the PDF header. Managing them across two separate sections (`Personal` and `Links`) increases mobile navigation height and forces unnecessary tab switching.
- **Planned Evolution:** Merge `Personal` and `Links` into a single contact section.
- **Source:** `src/pages/Links/Links.tsx:13`

### Skills Input Optimisation

- **Current State:** Skills utilise `BulletPoints`, introducing drag-and-drop complexity for single-line text items.
- **Planned Evolution:** Replace sortable bullet points with dynamic, lightweight text tags or pill inputs.
- **Source:** `src/pages/Skills/Skills.tsx:30–31`

### Schema Normalisation (`link` to `url`)

- **Legacy Context:** The former `Link` interface used `{ link: string, text: string }`. The domain model is undergoing a separate migration.
- **Proposed Evolution:** Consider whether `url` is preferable and whether any entity IDs are unused. Data-model changes need their own approval.

---

## 5. Rich Content & Resume Engineering

### Inline Accomplishment Formatting & Sub-Bullets

- **Current State:** Bullet points are plain text strings only.
- **Planned Evolution:** Add inline Markdown formatting (bold and italic) to highlight key accomplishments and metrics, alongside optional nested sub-bullet points.
- **Sources:** `src/components/BulletPoints/BulletPoints.tsx:171–173`

### Flexible Link Delimiters & Custom Links

- **Current State:** PDF preview links are fixed to brand SVG icons with preset options (Website, GitHub, LinkedIn, Telegram).
- **Planned Evolution:** Support reordering links, adding arbitrary custom links (e.g. HackerRank, portfolio subdomains) and toggling between brand icons and minimalist pipe (`|`) delimiters.
- **Sources:** `src/pages/Links/Links.tsx:9, 11`

### Contextual Resume Guidance

- **Planned Evolution:** Provide field-level guidance and tips drawn from _The Tech Resume Inside Out_ (e.g. framing accomplishments using Google's X-Y-Z formula, advising against low-signal biographical fields).
- **Sources:** `src/App/App.tsx:54, 65`

---

## 6. Internationalisation (i18n)

### Multilingual Resumes & Cyrillic Typography

- **Current State:** The generator is hardcoded for English resumes and standard Latin character subsets.
- **Planned Evolution:** Introduce a language switcher for Russian resume creation, accompanied by dynamic Cyrillic font subset loading in `src/App/loadFonts.ts`.
- **Sources:** `src/App/App.tsx:42`, `src/App/loadFonts.ts:3`

---

## 7. Accessibility (WCAG 2.2 AA) & Design Polish

### Roving Tabindex & Drag-and-Drop Announcements

- **Planned Evolution:** Extend live announcements to navbar reordering operations (`dragstart`, `dragover`, `dragend`), matching the accessible implementation in `BulletPoints`.
- **Source:** `src/components/AppLayout/Sidebar/Navbar/Navbar.tsx:165`

### APCA Contrast Auditing

- **Planned Evolution:** Audit colour palettes against the Accessible Perceptual Contrast Algorithm (APCA) to ensure optimal reading comfort.
- **Source:** `src/App/App.tsx:51–52`

### Native Dialogs & Invoker Commands API

- **Planned Evolution:** Upgrade modal dialog interactions using the modern HTML Invoker Commands API and native light dismiss.

---

## 8. Long-Term Explorations

Accessible exported CVs and verified ATS compatibility are future goals, not established capabilities. The [product reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/product.md) and [accessibility reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/accessibility.md) describe the goals and current export gap without selecting an implementation.

- **Automated ATS Verification:** Explore testing generated CVs against relevant Applicant Tracking System parsing workflows; the approach and acceptance criteria are not yet approved.
- **AI-Assisted Tailoring:** Optional integration for evaluating job description alignment and language clarity.
- **Cloud Account Synchronisation:** Optional backend service for persisting and syncing resumes across devices.
