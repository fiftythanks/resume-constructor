# CSS Container Query Patterns & Best Practices

This reference covers multi-breakpoint container queries, container naming, container units (`cqw`, `cqh`) and nesting strategies for component-level responsive styling.

---

## 1. Declaring Containers

To enable container queries on a component root element:

```scss
.JobCard {
  /* Establish an inline-size container context */
  container-type: inline-size;
  container-name: job-card;
  display: flex;
  flex-direction: column;
}
```

### Container Types

- `container-type: inline-size`: Tracks the container's inline axis (width in horizontal writing modes). This is the standard setting for all components.
- `container-type: normal`: Removes container query context while preserving container naming if required.
- `container-type: size`: Tracks both inline and block dimensions. Rarely needed and can cause infinite layout loops if dimensions depend on contents.

---

## 2. Multi-Breakpoint Responsive Styling

Components adapt their internal layout based on their own rendered width rather than the viewport size:

```scss
.JobCard {
  container-type: inline-size;
  container-name: job-card;

  &-Header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &-Meta {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  /* Compact layout: Narrow sidebars or mobile view */
  @container job-card (max-width: 380px) {
    &-Actions {
      width: 100%;
      justify-content: stretch;
    }
  }

  /* Expanded layout: Main content area on desktop */
  @container job-card (min-width: 600px) {
    &-Header {
      flex-direction: row;
      justify-content: space-between;
      align-items: baseline;
    }

    &-Meta {
      font-size: 14px;
    }
  }
}
```

---

## 3. Container Relative Units

Container units scale dynamically with the container's inline or block size:

- `1cqw`: 1% of the query container's width.
- `1cqh`: 1% of the query container's height.
- `1cqi`: 1% of the query container's inline size (recommended over `cqw` for internationalisation).
- `1cqb`: 1% of the query container's block size.
- `1cqmin`: The smaller value of `cqi` or `cqb`.
- `1cqmax`: The larger value of `cqi` or `cqb`.

### Fluid Typography Example

```scss
.JobCard-Title {
  /* Clamp between a minimum of 16px, fluid 3.5cqi and maximum of 24px */
  font-size: clamp(16px, 3.5cqi, 24px);
  line-height: 1.25;
}
```

---

## 4. Nesting Containers Safely

When a container component contains child components that also define their own containers, always use explicit `container-name` values to prevent query ambiguity:

```scss
/* Parent container */
.SectionContainer {
  container-type: inline-size;
  container-name: section-box;
}

/* Child component */
.SkillItem {
  container-type: inline-size;
  container-name: skill-item;

  /* Targets only the child container */
  @container skill-item (min-width: 200px) {
    display: inline-flex;
  }

  /* Targets the parent section container */
  @container section-box (min-width: 800px) {
    margin-bottom: 12px;
  }
}
```

---

## 5. Architectural Invariant Reminder

- **Macro-Layout vs Micro-Layout:**
  `@media` queries are reserved strictly for `AppLayout.scss` (e.g. mobile drawer navigation vs desktop sidebar). All child and leaf components must use `@container` queries exclusively.
