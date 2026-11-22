---
title: Form Engineering & Section Architecture
description: Granular analysis of form controls, accessibility semantics, dynamic pagination and drag-and-drop mechanics in Resume Constructor.
---

The editing interface is organised around section tabpanels in the application shell. Its forms combine explicit labels, state updates and keyboard interaction. WCAG 2.2 AA is a web target rather than a claim of complete conformance; see the [accessibility reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/accessibility.md) and [TypeScript and React reference](https://github.com/fiftythanks/resume-constructor/blob/main/docs/reference/typescript-react.md).

```mermaid
flowchart LR
    NavbarTab["Navbar Tab<br/>(role=#quot;tab#quot;)"] -->|aria-controls| SectionPanel["Section Tabpanel<br/>(role=#quot;tabpanel#quot;)"]
    SectionPanel --> SectionForm["Accessible Form<br/>(Explicit htmlFor Labels)"]
    SectionForm --> PaginationNav["Pagination Header<br/>(Prev/Next/Add/Delete)"]
    SectionForm --> SortableList["Sortable Accomplishments<br/>(@dnd-kit/BulletPoints)"]
```

---

## 1. Accessible Form Semantics

Every section component is bound to the sidebar navigation using explicit WAI-ARIA tabpanel contracts:

- **Tabpanel Binding:** The root element of each page is a `<section>` element marked with `role="tabpanel"`, `id="<sectionId>-tabpanel"` and `aria-labelledby="<sectionId>"`.
- **Explicit Label Coupling:** Under `jsx-a11y/label-has-associated-control`, implicit wrapping is strictly prohibited. Every `<input>` and `<textarea>` control is programmatically linked to an adjacent `<label>` through matching `id` and `htmlFor` attributes.
- **DOM Order & Focus:** The shell and page order support forward keyboard navigation from the navbar into the active panel. `useLastComponentBeforeTabpanel` handles a reverse-navigation boundary by returning focus from the first interactive control to the controlling tab. These patterns do not establish that every focus transition is covered.

---

## 2. Legacy Domain Data Structures

The following table describes the legacy model formerly defined in `src/types/resumeData.ts`. A separate domain migration is pending; this table is historical context, not a specification of the new data model.

| Section            | Model Interface  | Primary Properties                                             | Key Dynamic Behaviours                                                  |
| ------------------ | ---------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Personal**       | `Personal`       | `fullName`, `jobTitle`, `email`, `phone`, `address`, `summary` | Flat form with dedicated HTML input types (`email`, `tel`).             |
| **Education**      | `Education`      | `shownDegreeIndex`, `degrees: Degree[]`                        | Carousel card pagination, degree fields and nested bullet points.       |
| **Experience**     | `Experience`     | `shownJobIndex`, `jobs: Job[]`                                 | Carousel card pagination, job history fields and nested bullet points.  |
| **Projects**       | `Projects`       | `shownProjectIndex`, `projects: Project[]`                     | Carousel card pagination, code/demo repository links and bullet points. |
| **Skills**         | `Skills`         | `languages`, `frameworks`, `tools`                             | Three sequential accomplishment groups managed via `BulletPoints`.      |
| **Certifications** | `Certifications` | `certificates`, `skills`, `interests`                          | Multiline text areas capturing credentials and professional interests.  |
| **Links**          | `Links`          | `website`, `github`, `linkedin`, `telegram`                    | Paired link descriptors containing anchor text and target URL.          |

---

## 3. Dynamic Carousel Pagination

In multi-item sections (Education, Experience and Projects), items are presented using a focused carousel pattern rather than an endless vertical list:

1. **Card Navigation:** The currently active record is tracked by index (`shownDegreeIndex`, `shownJobIndex`, `shownProjectIndex`). "Show Previous" and "Show Next" buttons allow traversing items.
2. **Atomic Entity Creation:** When adding a new item (e.g. `addDegree()`), a fresh record is initialised with unique entity UUIDs generated via `crypto.randomUUID()`. The view automatically switches to the newly created entity and focus shifts to its first input.
3. **Safe Deletion & Index Recalculation:** Deletion buttons are disabled when only one item remains. When an active item is deleted, `getNextShownIndex` shifts focus to the adjacent sibling or decrements to the preceding item if deleting the tail.

---

## 4. Drag-and-Drop Architecture (`@dnd-kit`)

Accomplishment lists in jobs, degrees, projects and skills use `@dnd-kit/core` and `@dnd-kit/sortable` inside the reusable `BulletPoints` primitive:

- **Sensors:** Configured with `PointerSensor` (requiring a distance threshold before drag initiation to distinguish intentional drags from clicks) and `KeyboardSensor` (using `sortableKeyboardCoordinates`).
- **Modifiers:** Constrained with `restrictToVerticalAxis` and `restrictToParentElement` to keep draggable items within their visual bounds.
- **Aria Live Feedback:** Comprehensive announcement dictionaries provide dynamic screen reader feedback:
  - Drag start: `"Picked up draggable item X."`
  - Drag over: `"Draggable item X was moved over droppable area Y."`
  - Drop confirmation: `"Draggable item X was dropped over droppable area Y."`
  - Cancellation: `"Dragging was cancelled. Draggable item X was put to its initial position."`
