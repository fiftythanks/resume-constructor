# Contributing Guidelines

Thank you for contributing to **Resume Constructor**! This repository follows a production-grade, zero-bootstrap development workflow. To maintain consistency, maintainability and code quality, please adhere to these guidelines.

---

## 1. Prerequisites & Environment

This project requires the **Bun** runtime (v1.1+). `bun.lock` is strictly enforced.

```bash
# Clone the repository
git clone https://github.com/fiftythanks/resume-constructor.git
cd resume-constructor

# Install dependencies (respecting lockfile)
bun install --frozen-lockfile

# Start local development server (webpack 5 dev server)
bun start

# Run unit and integration tests (Jest)
bun run test

# Run type check
bun x tsc --noEmit

# Verify production build
bun run build
```

> [!IMPORTANT]
> Never run bare `bun test`. Bun's native test runner does not run JSDOM or use the Jest test configuration. Always run `bun run test` (for full suite) or `bun x jest --bail --findRelatedTests <file> --passWithNoTests` (for targeted runs).

---

## 2. Git Branching Model

Create focused, short-lived topic branches branched off `main`:

- `feat/<feature-name>`: New functionality or architectural improvements
- `fix/<bug-name>`: Defect and layout fixes
- `refactor/<module-name>`: Code refactoring without behaviour change
- `chore/<task-name>`: Tooling, dependency, workflow or documentation updates

---

## 3. Commit Message Standards (Conventional Commits)

We strictly enforce the Conventional Commits specification with specific formatting constraints:

```text
<tag>(<scope>): <subject line in imperative mood>

<detailed body paragraph(s) explaining rationale and context>
```

### Constraints:

1. **Header Length:** The first line (header) must not exceed **50 characters**.
2. **Body Separation:** Exactly **one empty line** must separate the header from the body.
3. **Body Line Length:** Each line in the body must not exceed **80 characters**.
4. **Code References in Body:** Any identifiers, filenames, directory paths, component names, props or HTML/ARIA attributes in the body must be enclosed in **backticks** (e.g. `NavbarItem`, `src/hooks/`, `aria-describedby`).
5. **Language & Grammar:** Write all commit messages and code comments in **traditional British English** (e.g. "optimise", "initialise", "behaviour", "centre", "colour") and with **no Oxford commas** (use "A, B and C", never "A, B, and C").
6. **Dash Typography:** Em-rules (—) must **always** be separated by spaces from the surrounding text (e.g. "word — word"), but must not be separated by spaces from surrounding brackets if inside brackets. Never attach an em-rule directly to adjacent words. En-rules (–), representing ranges and similar things, must **not** have any spaces surrounding them (e.g. "1–10", "lines 20–35", "2020–2024").

### Code Comments Standards

1. **Multiline Comments:** Any code comment spanning multiple lines must be formatted as a JSDoc-style block comment (`/** ... */`) with leading asterisks on each continuation line. Consecutive `//` comments used to wrap sentences or paragraphs are strictly prohibited.
2. **Single-line Comments:** The `//` syntax is strictly reserved for standalone, single-line remarks. Consecutive single-line comments are permitted only when representing distinct annotations (e.g. separate `// TODO:` or `// DILEMMA:` entries).
3. **Language & Typography:** Comments must be written in traditional British English with strictly no Oxford comma, spaced em-rules (`—`) and unspaced en-rules (`–`) for ranges.

---

## 4. Systematised Tags & Scopes

### Allowed Tags (Types)

| Tag        | Purpose                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `feat`     | New user-facing feature or architectural capability                      |
| `fix`      | Bug fix in component markup, logic, accessibility or styles              |
| `refactor` | Code restructuring with no change to external behaviour                  |
| `test`     | Adding, updating or fixing automated unit, integration or E2E tests      |
| `docs`     | Documentation portal (`docs/`), guides, in-source JSDoc and comments     |
| `chore`    | Tooling, build pipeline, dependencies, CI, git hooks and repository docs |

### Allowed Scopes by Domain

All scopes must be **strictly lowercase**.

#### Domain A: UI Components & Application Shell (`src/components/`, `src/App/`)

- `app`: Root application component (`src/App/`)
- `applayout`: Application shell and layout grid (`src/components/AppLayout/`)
- `sidebar`: Sidebar container housing navigation and actions (`src/components/AppLayout/Sidebar/`)
- `navbar`: Navigation rail, section tabs and items (`src/components/AppLayout/Sidebar/Navbar/`)
- `toolbar`: Action toolbar, reset/populate actions and modal triggers (`src/components/AppLayout/Sidebar/Toolbar/`)
- `preview`: Resume preview modal, PDF compilation and canvas renderer (`src/components/Preview/`)
- `addsections`: Section adder popup and item list (`src/components/AddSections/`)
- `components`: Shared UI primitives (`Button`, `Popup`, `ListItem`, `BulletPoints`)

#### Domain B: Feature Pages & Resume Sections (`src/pages/`)

- `personal`: Personal details form (`src/pages/Personal/`)
- `education`: Education details and degree items (`src/pages/Education/`)
- `experience`: Work experience and employment history (`src/pages/Experience/`)
- `projects`: Projects, descriptions and URLs (`src/pages/Projects/`)
- `skills`: Skills section and categorised tags (`src/pages/Skills/`)
- `certifications`: Certifications and licences (`src/pages/Certifications/`)
- `links`: Custom links and social links (`src/pages/Links/`)
- `pages`: Cross-page adjustments and section wrappers

#### Domain C: Core Logic, Hooks, Types & Styles

- `hooks`: Custom React hooks (`src/hooks/`)
- `utils`: Utility functions (`src/utils/`)
- `types`: TypeScript interfaces, declarations and helpers (`src/types/`)
- `styles`: Global SCSS tokens, typography, custom properties and mixins (`src/styles/`)

#### Domain D: Infrastructure, Tooling & Build System

- `webpack`: webpack configuration files (`webpack.*.cjs`)
- `husky`: Git pre-commit and pre-push hooks (`.husky/`)
- `ci`: Continuous Integration workflows (`.github/workflows/`)
- `e2e`: Playwright test suites and configs (`e2e/`, `playwright.config.ts`)
- `jest`: Jest configuration and testing setup (`jest.config.ts`, `jest.setup.tsx`)
- `eslint`: ESLint flat configuration and rules (`eslint.config.js`)
- `package`: Dependency manifests and runtime updates (`package.json`, `bun.lock`)
- `readme`: Root repository documentation (`README.md`)
- `docs`: Documentation portal, guides and configuration (`docs/`)
- `agents`: AI instructions and skills (`GEMINI.md`, `.agents/skills/`)

> [!NOTE]
> Unscoped commits (`chore: ...`, `refactor: ...`) are permitted for broad changes spanning multiple domains (e.g. `chore: update dependencies`).

---

## 5. Architectural & Coding Principles

1. **Component Colocation:** Every component lives in its own folder under `src/components/<Name>/` containing `<Name>.tsx`, `<Name>.scss`, `<Name>.test.tsx` and a one-line `index.tsx` barrel export.
2. **Deep Immutability:** Component props must use `ReadonlyExcept<Props, 'ref'>` imported from `@/types/ReadonlyExcept`. Nested state updates must use `immer` or `use-immer`.
3. **Zero Redundant Effects:** Strictly adhere to `eslint-plugin-react-you-might-not-need-an-effect`. Derive state during render or inside event callbacks; never copy props to state or synchronise state via `useEffect`.
4. **Accessibility First (WCAG 2.2 AA):** All form controls must have explicit `htmlFor` labels. Manage focus with `tabbable`, announce dynamic updates politely via `aria-live="polite"` and ensure full keyboard operable interactions.
5. **Styling & BEM:** Component styles use React BEM (`BlockName-ElementName_modifierName_modifierValue`). Internal component scaling relies on CSS Container Queries (`@container`), reserving `@media` exclusively for macro-layout shifts in `AppLayout`.

---

## 6. Verification Sequence Before Submitting a PR

Before opening a pull request, verify your changes pass all local hygiene checks:

```bash
# 1. Verify TypeScript types
bun x tsc --noEmit

# 2. Check and fix ESLint errors
bun x eslint . --fix

# 3. Check and fix SCSS style issues
bun x stylelint "src/**/*.scss" --fix

# 4. Verify formatting
bun x prettier --write .

# 5. Run full test suite
bun run test

# 6. Verify production build
bun run build
```
