---
title: Project Roadmap & Technical Decisions
description: Comprehensive synthesis of codebase TODOs, architectural dilemmas and planned system evolutions in Resume Constructor.
---

## Overview

This roadmap synthesises the architectural priorities, engineering directives and open tasks from the project specification, internal task logs and source code annotations (`TODO:`, `FIXME:`, `DILEMMA:`). Items are organised by priority and domain.

---

## 1. Macro Responsive Scaling Strategy (Immediate Priority)

The highest immediate priority is adapting Resume Constructor from a mobile-first single-column layout into an adaptive, multi-viewport workspace based on the project's responsive scaling strategy.

### Desktop & Tablet Shell Adaptation

- **Hybrid CSS Architecture:** Global `@media` queries exclusively govern macro-layout shifts in `AppLayout`, while all internal component responsiveness relies on CSS Container Queries (`@container`).
- **Unified Sidebar (`@media (min-width: 768px)`):** Transition from mobile bottom-docked navigation to a permanent desktop sidebar on the left containing both navigation tabs and toolbar actions.
- **Dynamic ARIA Synchronisation:** When hiding mobile drawer toggles on wider screens, React state will programmatically enforce a permanently expanded `aria-expanded="true"` state on desktop navigation.
- **Dual-Pane Side-by-Side Workspace:** On medium and large displays, the interface will display the active section editor alongside a persistent live preview pane. Mobile viewports remain single-column form editors without live preview due to screen real estate constraints, with preview accessed via the on-demand modal before download.
- **Skip Links (WCAG 2.4.1):** Introduce keyboard skip links as the first interactive element inside the sidebar to allow keyboard and screen reader users to jump straight to the active form editor.

### Pure JSX Live Preview (Desktop/Tablet) & Real PDF Parity

- **Main-Thread Performance:** Implement a pure DOM-based JSX live preview exclusively for wider viewports to provide instant typing feedback. Running the existing `@react-pdf/renderer` compilation and `pdfjs-dist` canvas rasterization dynamically during interactive typing would cause disastrous performance degradation; the pure JSX DOM engine eliminates canvas rasterization overhead.
- **Engine Parity via Universal Primitives:** Enforce strict Yoga-compliant Flexbox rules across shared layout primitives to guarantee pixel-level parity between DOM preview and exported PDF.
- **Pre-Download Real PDF Verification:** Retain the full `@react-pdf/renderer` and `pdfjs-dist` canvas modal pipeline as the final pre-download inspection step with an engine toggle ("Switch to Real PDF") within the desktop preview pane to verify exact vector pagination on demand.
- **Effect Pruning:** Replace `useDebouncedWindowSize` and synchronous resize listeners with modern `@container` queries and `ResizeObserver`.

---

## 2. Core Fixes & Stability

### Focus Management Continuity

- **Current Issue:** When navigating between records ("Show Previous" or "Show Next") or deleting an active item in Education, Experience and Projects, browser focus blurs to `document.body`.
- **Planned Fix:** Implement programmatic focus retention using React refs to return focus to the newly activated card or the primary add action.
- **Sources:** `src/pages/Education/Education.tsx:88`, `src/pages/Experience/Experience.tsx:88`

### Document Rendering Parity & Bug Fixes

- **Link Presence Checks:** Replace `activeSectionIds` checks in `ResumeDocument` with content-based checks so empty sections do not render orphaned delimiters.
- **Single Contact Item Display:** Fix header layout bug where email fails to display when no custom links are present.
- **Multi-Page Page Breaks:** Fix squashing bug in `@react-pdf/renderer` when content exceeds one page, ensuring second and subsequent pages break cleanly.
- **PDF Blob Race Condition:** Resolve `ERR_FILE_NOT_FOUND` blob URL errors during rapid bullet point additions.
- **Toolbar Accessibility:** Ensure toolbar triggers possess explicit `aria-controls` referencing their target dialogs.
- **Sources:** `src/components/Preview/ResumeDocument.tsx:62, 99`, `src/components/Preview/Preview.tsx:31`

---

## 3. Persistence & State Architecture

### Local Storage Synchronisation

- **Current State:** Resume data is stored solely in React memory. Accidental tab closures or browser restarts result in complete data loss.
- **Planned Evolution:** Add a debounced `localStorage` synchronization layer in `src/App/App.tsx` with automatic draft recovery and snapshot history.
- **Source:** `src/App/App.tsx:32`

### Decomposition of `useAppState` & Zero-Effect Architecture

- **Current State:** `useAppState.ts` combines document section topology, navbar interaction mode (`editorMode`) and screen reader live announcements. It violates `react-you-might-not-need-an-effect` by using `useEffect` to watch state changes (`sectionsState` and `editorMode`) and trigger `setScreenReaderAnnouncement`, causing double-render cascades across the entire app shell and chained state race conditions.
- **Planned Evolution:**
  1. **Event-Driven Live Announcements:** Remove announcement `useEffect` hooks and ref diffing (`previousSectionsStateRef`). Trigger screen reader messages directly inside user interaction callbacks (`openSection`, `addSections`, `deleteSections`, `reorderSections` and `toggleEditorMode`).
  2. **Colocate Navbar Mode:** Push `editorMode` down to `Navbar` or `AppLayout` so local drawer and reordering toggles do not re-render the root `App` and active form panels.
  3. **Decompose Responsibilities:** Split the monolithic hook into focused utilities:
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

- **Current State:** The `Link` interface defines `{ link: string, text: string }`.
- **Planned Evolution:** Rename the `link` property to `url` to conform to standard terminology and strip unused top-level entity IDs.
- **Sources:** `src/types/resumeData.ts:65, 113, 146`

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

- **Planned Evolution:** Audit color palettes against the Accessible Perceptual Contrast Algorithm (APCA) to ensure optimal reading comfort.
- **Source:** `src/App/App.tsx:51–52`

### Native Dialogs & Invoker Commands API

- **Planned Evolution:** Upgrade modal dialog interactions using the modern HTML Invoker Commands API and native light dismiss.

---

## 8. Long-Term Explorations

- **Automated ATS Verification:** Test generated resumes against leading Applicant Tracking System parsers to ensure machine readability.
- **AI-Assisted Tailoring:** Optional integration for evaluating job description alignment and language clarity.
- **Cloud Account Synchronisation:** Optional backend service for persisting and syncing resumes across devices.
