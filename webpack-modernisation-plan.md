# Modernising webpack Configuration: Architectural Plan & Findings

## 1. Executive Summary

This modernisation plan outlines the migration of the application build pipeline to modern native webpack features introduced in webpack 5.109+ and webpack 5.111+. The current build setup relies on legacy third-party plugins and loaders (`html-webpack-plugin`, `html-loader`, `style-loader`, `css-loader`, `css-minimizer-webpack-plugin` and `clean-webpack-plugin`) that introduce defects, unnecessary bundle overhead and deprecated configuration patterns.

By adopting native HTML (`experiments.html: true`) and native CSS (`experiments.css: true`), the build pipeline achieves:

1. **Preservation of CSS `@layer` in Inline `<style>`:** Directly resolves the issue where production builds stripped `@layer reset, base, blocks, helpers;` from [src/index.html](file:///home/saprilonty/repos/vercel-issue/src/index.html).
2. **Elimination of Worker Leakage:** Prevents [pdf.worker.bundle.js](file:///home/saprilonty/repos/vercel-issue/dist/pdf.worker.bundle.js) (1.14 MiB) from being injected into the HTML document and parsed on the main thread during initial page load.
3. **Native CSS Extraction & Minification:** Moves away from runtime DOM style injection via `style-loader` in favour of native CSS extraction and built-in CSS minification, preventing Flash of Unstyled Content (FOUC).
4. **Dependency Reduction:** Eliminates six legacy npm packages from [package.json](file:///home/saprilonty/repos/vercel-issue/package.json), reducing dependency maintenance and build complexity.

---

## 2. Analysis of Current Configuration & Discovered Defects

### 2.1. Defect 1: `<style>` Stripping in Production Builds

In [src/index.html](file:///home/saprilonty/repos/vercel-issue/src/index.html), the application establishes CSS layer precedence before any styles evaluate:

```html
<style>
  @layer reset, base, blocks, helpers;
</style>
```

In development mode (`bun start`), webpack serves the template without aggressive minification, keeping the tag intact. However, in production mode (`bun run build`), [webpack.common.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.common.cjs) processes the document through `html-webpack-plugin`. In production, `html-webpack-plugin` activates `html-minifier-terser`, which delegates inline CSS minification to `clean-css`.

Because `clean-css` treats `@layer reset, base, blocks, helpers;` without nested rules as empty declarations, it strips the contents completely, emitting `<style></style>` into [dist/index.html](file:///home/saprilonty/repos/vercel-issue/dist/index.html). This breaks layer ordering and leads to cascade ordering conflicts in production.

### 2.2. Defect 2: Main-Thread Worker Execution Leak

In [webpack.common.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.common.cjs#L8-L11), two entry points are declared:

```javascript
entry: {
  app: path.resolve(__dirname, 'src/index.tsx'),
  'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs',
},
```

Because `new HtmlWebpackPlugin({ template: './src/index.html' })` did not restrict its injected chunks, it automatically injected every entry point into the generated HTML:

```html
<script defer="defer" src="app.bundle.js"></script>
<script defer="defer" src="pdf.worker.bundle.js"></script>
```

As verified in [dist/index.html](file:///home/saprilonty/repos/vercel-issue/dist/index.html), this forces the client browser to download, parse and execute the 1.14 MiB PDF worker on the main thread when loading the website. Meanwhile, [src/components/Preview/Preview.tsx](file:///home/saprilonty/repos/vercel-issue/src/components/Preview/Preview.tsx#L38) independently points `pdfjsLib.GlobalWorkerOptions.workerSrc` to the compiled bundle to run it off the main thread in a dedicated Web Worker. The legacy configuration therefore caused duplicate script loading and wasted 1.14 MiB of initial network bandwidth.

### 2.3. Defect 3: Redundant & Deprecated Build Plugins

- **`clean-webpack-plugin`:** [webpack.prod.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.prod.cjs#L1) imports and instantiates `CleanWebpackPlugin`. This is completely redundant because [webpack.common.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.common.cjs#L29) already enables `output.clean: true` (a native webpack feature since v5.20.0).
- **`css-minimizer-webpack-plugin`:** [webpack.prod.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.prod.cjs#L2) uses `CssMinimizerPlugin` to minify CSS. Under native CSS (`experiments.css: true`), webpack automatically minifies CSS assets with its built-in minimizer during production optimization.
- **`html-loader` & `html-webpack-plugin`:** Both packages are superseded by native HTML handling (`experiments.html: true`). As stated in official webpack guidance, plain HTML requires no loader and no plugin.

### 2.4. Defect 4: Inefficient CSS Injection in Production

In [webpack.common.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.common.cjs#L34-L54), styles are compiled using `style-loader`, `css-loader`, `postcss-loader` and `sass-loader`. `style-loader` injects CSS into DOM `<style>` tags at runtime via JavaScript. In production, this causes:

- Potential Flash of Unstyled Content (FOUC) while JavaScript executes.
- Inability for browsers to cache stylesheets independently from JavaScript bundles.
- Inflated JavaScript bundle size and execution time.

### 2.5. Defect 5: Unnecessary DevServer Watchers

In [webpack.dev.cjs](file:///home/saprilonty/repos/vercel-issue/webpack.dev.cjs#L11), `watchFiles: ['./src/index.html']` is configured because `html-webpack-plugin` did not integrate the HTML template into the primary webpack module graph. With native HTML, HTML files are first-class modules with built-in HMR and change tracking.

---

## 3. Recommended Modernisation Architecture

### 3.1. Native HTML via `experiments.html: true`

webpack natively parses `.html` files as first-class modules, discovering and bundling all `<script>`, `<link>`, `<img>` and inline `<style>` tags.

According to the official webpack documentation, there are two primary patterns:

1. **HTML Entry Point (Recommended):**
   - The HTML document drives the build: `entry: { html: path.resolve(__dirname, 'src/index.html'), 'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs' }`.
   - In [src/index.html](file:///home/saprilonty/repos/vercel-issue/src/index.html), add `<script type="module" src="./index.tsx"></script>`.
   - webpack builds the dependency graph directly from the markup.
   - **Why this solves Defect 1:** webpack routes inline `<style>` bodies through its native CSS pipeline. The `@layer` at-rule is validated and preserved; it is never stripped or emptied.
   - **Why this solves Defect 2:** The HTML entry point only requests `./index.tsx`. Consequently, `pdf.worker` is compiled as an independent worker asset and is **never** injected into the HTML document.
   - **Built-in HMR:** HTML updates trigger native in-place DOM patching without requiring `devServer.watchFiles`.
   - **Built-in Minification:** webpack minifies HTML assets automatically during production builds when `optimization.minimize` is enabled.

2. **Generated Page for JavaScript Entry (Alternative):**
   - Retain `entry: { app: './src/index.tsx', 'pdf.worker': { import: 'pdfjs-dist/build/pdf.worker.mjs', html: false } }`.
   - Set `output.html: true` and configure `module.parser.html.template`.
   - _Evaluation:_ The HTML entry point pattern (Option 1) is cleaner, more declarative, aligns with modern standards and removes configuration boilerplate.

### 3.2. Dev Server Entry Collision (`Multiple chunks emit assets to the same filename`)

When using an authored HTML entry point alongside an embedded script tag (`<script type="module" src="./index.tsx"></script>`), naming the entry key `index` in `entry: { index: path.resolve(__dirname, 'src/index.html') }` creates a chunk collision during development:

1. **Dev-Server Client Injection:** Under `webpack serve`, `webpack-dev-server` automatically injects its websocket client and HMR runtime modules into every declared entry point.
2. **Entry Chunk JS Emission:** Because entry `index` receives the dev-server client JavaScript modules, it emits a JavaScript bundle: `output.filename: '[name].bundle.js'` resolves to `index.bundle.js`.
3. **HTML Script Chunk Emission:** In parallel, webpack parses `<script type="module" src="./index.tsx"></script>` from [src/index.html](file:///home/saprilonty/repos/vercel-issue/src/index.html) into an internal script chunk (`__html_...`), which also resolves to `index.bundle.js`.
4. **Collision:** Both the dev-server client entry chunk and the application script chunk attempt to write to `index.bundle.js`, causing the build to fail with:
   ```text
   Conflict: Multiple chunks emit assets to the same filename index.bundle.js (chunks index and __html_6d047296_0)
   ```
5. **Resolution:** Name the HTML entry key distinctly (e.g. `html: path.resolve(__dirname, 'src/index.html')`). This isolates the dev-server runtime chunk (`html.bundle.js`) from the application chunk (`index.bundle.js`), allowing both development server and production builds to compile cleanly without conflict.

### 3.3. Native CSS via `experiments.css: true` & PostCSS Elimination

webpack natively understands `.css` files without `css-loader` or `style-loader`.

- **Preprocessors Keep Their Loaders:** According to official loader documentation, preprocessors (Sass/SCSS) keep their loaders and output CSS into the native pipeline:
  ```javascript
  {
    test: /\.s[ac]ss$/i,
    use: ['sass-loader'],
    type: 'css',
  }
  ```
- **PostCSS & Autoprefixer Removal:** PostCSS was used solely for vendor prefixing via `autoprefixer`. Because the project configures `"browserslist": ["baseline widely available"]`, all modern target browsers natively support CSS Grid, Flexbox, Container Queries (`@container`), Cascade Layers (`@layer`) and CSS custom properties without prefixes. The only vendor prefix in the application stylesheets (`-webkit-font-smoothing: antialiased;` in [src/styles/base/_reset.scss](file:///home/saprilonty/repos/vercel-issue/src/styles/base/_reset.scss)) is authored manually. In addition, webpack's native CSS minimizer handles browser vendor prefixes automatically when `target: 'browserslist'` is set. Consequently, `postcss`, `autoprefixer` and `postcss-loader` are obsolete and can be eliminated completely.
- **Native CSS Extraction:** The default output mode (`exportType: "link"`) automatically extracts compiled CSS into standalone `.css` files (`output.cssFilename: '[name].bundle.css'`) and injects the corresponding `<link rel="stylesheet">` tags into the emitted HTML.
- **Native Minification:** Replaces `css-minimizer-webpack-plugin`. webpack minifies CSS rules, selectors and values natively under `mode: 'production'`.

### 3.4. TypeScript Configuration Migration (`.cjs` to `.ts`) & DiagnosticsPlugin

Migrating configuration files from CommonJS (`webpack.common.cjs`, `webpack.dev.cjs` and `webpack.prod.cjs`) to TypeScript (`webpack.common.ts`, `webpack.dev.ts` and `webpack.prod.ts`) introduces modern typing, ESM import syntax and unified lint diagnostics. However, three critical build pitfalls must be addressed:

1. **Native `experiments.typescript` Integration with JSX Components:**
   - Setting `experiments.futureDefaults: true` automatically enables `experiments.typescript: true` in webpack 5.111+.
   - webpack's native `TypeScriptPlugin` uses Node.js's built-in `module.stripTypeScriptTypes` API to strip types from `.ts` files directly without any loader.
   - However, Node.js type stripping explicitly does not support JSX syntax. In `TypeScriptPlugin._processResult`, webpack checks whether `parser.options.typescript` is true for matching files; if a `.tsx` resource enters this hook, it throws:
     ```text
     Error: experiments.typescript does not support .tsx/JSX. Use a TSX-capable loader (e.g. swc-loader, esbuild-loader, ts-loader) for .tsx files.
     ```
   - _Resolution:_ Do not disable `experiments.typescript` globally. Instead, configure a rule specifically for `.tsx` files with `parser: { typescript: false }` and compile them using `ts-loader`. This instructs webpack's `TypeScriptPlugin` to skip `.tsx` files (allowing `ts-loader` to transpile React JSX into plain JavaScript), while allowing pure `.ts` modules across the project to be processed by webpack's native type stripper.

2. **Extensionless ESM Imports in `.ts` Modules (`fullySpecified: false`):**
   - In ECMAScript Modules (`"type": "module"` in [package.json](file:///home/saprilonty/repos/vercel-issue/package.json)), webpack's default ESM resolver enforces `fullySpecified: true`, requiring explicit file extensions on relative import paths.
   - Under native `experiments.typescript`, `.ts` modules are treated as ESM modules, causing imports like `import { getDefaultData } from './getDefaultData'` to fail with `failed to resolve only because it was resolved as fully specified`.
   - _Resolution:_ Add a rule for `.ts` files with `resolve: { fullySpecified: false }` (without adding a loader). This preserves extensionless imports while leaving native `experiments.typescript` fully active.

3. **Strict Type-Only Imports (`import type`):**
   - Node.js's native `module.stripTypeScriptTypes` strips type declarations but preserves JavaScript value imports (`import { ... }`).
   - When a module contains only TypeScript types (such as [src/types/resumeData.ts](file:///home/saprilonty/repos/vercel-issue/src/types/resumeData.ts)), the native stripper removes all exported type statements, leaving an empty JavaScript module at runtime.
   - Importing types via value syntax (`import { ResumeData } from '@/types/resumeData'`) causes webpack under `futureDefaults: true` (`exportsPresence: "error"`) to fail because the stripped runtime module exports nothing.
   - _Resolution:_ Strictly use explicit type imports (`import type { ResumeData, SectionId } from '@/types/resumeData'`). Node's native type stripper elides `import type` statements completely, preventing runtime import mismatches.

4. **`ts-loader` Project Scope & Extension Imports (`TS5097`):**
   - By default, `ts-loader` typechecks all files within the TypeScript project specified by [tsconfig.json](file:///home/saprilonty/repos/vercel-issue/tsconfig.json), including `scripts/bot-run.ts`, `webpack.dev.ts` and `webpack.prod.ts`.
   - In [tsconfig.json](file:///home/saprilonty/repos/vercel-issue/tsconfig.json), `"allowImportingTsExtensions": true` allows explicit `.ts` extensions in import statements. However, `ts-loader` overrides `compilerOptions: { allowImportingTsExtensions: false }` for emitting output bundles.
   - Without `onlyCompileBundledFiles: true`, `ts-loader` validated unbundled project files against this override, failing with `TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled`.
   - _Resolution:_ Configure `onlyCompileBundledFiles: true` in `ts-loader` options. This restricts type checking to modules within the webpack dependency graph, avoiding false positives on standalone configuration and script files.

5. **Missing `.tsx` and `.jsx` Extensions in `resolve.extensions`:**
   - When specifying `resolve.extensions`, omitting `.tsx` and `.jsx` prevents webpack from resolving extensionless imports of React components (such as `import App from './App'`).
   - _Resolution:_ Register `extensions: ['.tsx', '.ts', '.jsx', '.mjs', '.js', '.json', '.mts']` in [webpack.common.ts](file:///home/saprilonty/repos/vercel-issue/webpack.common.ts).

6. **Diagnostics Consolidation via `diagnostics-webpack-plugin`:**
   - Replaces individual `eslint-webpack-plugin` and `stylelint-webpack-plugin` instances with a single unified diagnostics runner maintained by the webpack organization.
   - Performs concurrent lint passes for ESLint and Stylelint during compilation, reporting diagnostics directly into webpack build output.

### 3.5. Elimination of Redundant Plugins & Rules

- Remove `CleanWebpackPlugin` from production configuration. Native `output.clean: true` in [webpack.common.ts](file:///home/saprilonty/repos/vercel-issue/webpack.common.ts) handles directory cleaning.
- Remove `CssMinimizerPlugin` from production configuration.
- Remove `html-loader` rule and `HtmlWebpackPlugin` from [webpack.common.ts](file:///home/saprilonty/repos/vercel-issue/webpack.common.ts).
- Remove `watchFiles: ['./src/index.html']` from [webpack.dev.ts](file:///home/saprilonty/repos/vercel-issue/webpack.dev.ts).
- Replace `eslint-webpack-plugin` and `stylelint-webpack-plugin` with `diagnostics-webpack-plugin`.

---

## 4. Proposed Configuration Files

### 4.1. [src/index.html](file:///home/saprilonty/repos/vercel-issue/src/index.html)

Add the application script module tag directly into `<head>` or `<body>`. webpack rewrites the source reference to the emitted bundle with appropriate hashes in production:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume Constructor</title>
    <style>
      @layer reset, base, blocks, helpers;
    </style>
    <script type="module" src="./index.tsx"></script>
  </head>
  <body>
    <noscript>
      <p>
        This application requires JavaScript to function properly. Please enable
        JavaScript in your browser settings and refresh the page.
      </p>
    </noscript>
    <div id="root"></div>
    <div id="popup-root"></div>
  </body>
</html>
```

### 4.2. [webpack.common.ts](file:///home/saprilonty/repos/vercel-issue/webpack.common.ts)

```typescript
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import DiagnosticsPlugin from 'diagnostics-webpack-plugin';

import type { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Configuration = {
  target: 'browserslist',
  experiments: {
    html: true,
    css: true,
    futureDefaults: true,
  },
  entry: {
    html: path.resolve(__dirname, 'src/index.html'),
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.mjs', '.js', '.json', '.mts'],
    tsconfig: true,
  },
  output: {
    filename: '[name].bundle.js',
    htmlFilename: '[name].html',
    cssFilename: '[name].bundle.css',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    module: true,
  },
  plugins: [
    new DiagnosticsPlugin({
      checks: [
        { use: 'eslint', extensions: ['js', 'mjs', 'ts', 'mts', 'tsx', 'jsx'] },
        { use: 'stylelint', extensions: ['css', 'scss'] },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ['sass-loader'],
        type: 'css',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.ts$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        parser: {
          typescript: false,
        },
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              allowImportingTsExtensions: false,
              noEmit: false,
            },
            onlyCompileBundledFiles: true,
          },
        },
      },
    ],
  },
};

export default config;
```

### 4.3. [webpack.dev.ts](file:///home/saprilonty/repos/vercel-issue/webpack.dev.ts)

```typescript
import { merge } from 'webpack-merge';

import common from './webpack.common.ts';

import type { Configuration } from 'webpack';

import 'webpack-dev-server';

const config = merge<Configuration>(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    server: 'https',
    static: './dist',
  },
});

export default config;
```

### 4.4. [webpack.prod.ts](file:///home/saprilonty/repos/vercel-issue/webpack.prod.ts)

```typescript
import { merge } from 'webpack-merge';

import common from './webpack.common.ts';

import type { Configuration } from 'webpack';

const config = merge<Configuration>(common, {
  mode: 'production',
  devtool: 'source-map',
});

export default config;
```

---

## 5. Dependency Clean-Up Plan

Once the modernised configuration is verified, the following obsolete packages can be cleanly removed from [package.json](file:///home/saprilonty/repos/vercel-issue/package.json):

| Package Name                   | Reason for Removal                                    | Modern Replacement             |
| :----------------------------- | :---------------------------------------------------- | :----------------------------- |
| `html-webpack-plugin`          | Superseded by native HTML module support              | `experiments.html: true`       |
| `html-loader`                  | Plain HTML is parsed natively without loaders         | `experiments.html: true`       |
| `clean-webpack-plugin`         | Redundant third-party plugin                          | Native `output.clean: true`    |
| `style-loader`                 | Superseded by native CSS handling                     | `experiments.css: true`        |
| `css-loader`                   | Native CSS parsing handles imports and URLs           | `experiments.css: true`        |
| `css-minimizer-webpack-plugin` | Built-in CSS minification in production               | Native `optimization.minimize` |
| `postcss`                      | Redundant prefixing for modern Baseline targets       | Baseline Widely Available      |
| `autoprefixer`                 | Modern browser baseline requires zero vendor prefixes | Baseline Widely Available      |
| `postcss-loader`               | SCSS compiles directly to native CSS                  | Native `type: 'css'`           |
| `eslint-webpack-plugin`        | Superseded by consolidated diagnostics plugin         | `diagnostics-webpack-plugin`   |
| `stylelint-webpack-plugin`     | Superseded by consolidated diagnostics plugin         | `diagnostics-webpack-plugin`   |

Command to prune obsolete dependencies:

```bash
bun remove html-webpack-plugin html-loader clean-webpack-plugin style-loader css-loader css-minimizer-webpack-plugin postcss autoprefixer postcss-loader eslint-webpack-plugin stylelint-webpack-plugin
```

---

## 6. Migration Risk Analysis & Mitigation

1. **CSS Precedence and `@layer` Integrity:**
   - _Risk:_ Inline styles or extracted CSS loading in unexpected order.
   - _Mitigation:_ In native HTML, stylesheet `<link>` tags are placed in `<head>` ahead of scripts, while inline `<style>` tags remain in their exact authored order. The `@layer` definition evaluates before any stylesheet rules.
2. **Worker Chunk Resolution:**
   - _Risk:_ Web Worker path resolution breaking in [src/components/Preview/Preview.tsx](file:///home/saprilonty/repos/vercel-issue/src/components/Preview/Preview.tsx).
   - _Mitigation:_ `entry: { 'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs' }` continues emitting `pdf.worker.bundle.js` into `dist/`. The output path matches `pdfjsLib.GlobalWorkerOptions.workerSrc` without change, while keeping the main-thread HTML free of worker scripts.
3. **TypeScript & SCSS Pipeline:**
   - _Risk:_ SCSS compilation or TypeScript transpilation issues.
   - _Mitigation:_ `sass-loader` and `ts-loader` remain completely intact. The bridge loaders (`css-loader` and `style-loader`) as well as `postcss-loader` are removed, allowing `sass-loader` to feed pure CSS directly into webpack via `type: 'css'` without regression. `onlyCompileBundledFiles: true` isolates `ts-loader` from unbundled script files.
4. **Automated Testing Parity:**
   - _Risk:_ Jest tests or linting being affected.
   - _Mitigation:_ Jest runs through `ts-jest` and `identity-obj-proxy` independent of webpack configurations. All 29 test suites (593 tests) remain unaffected.

---

## 7. Step-by-Step Implementation Roadmap

1. **Step 1 — Markup Enhancement:** Add `<script type="module" src="./index.tsx"></script>` to [src/index.html](file:///home/saprilonty/repos/vercel-issue/src/index.html).
2. **Step 2 — Configuration Update:** Apply updated configurations to [webpack.common.ts](file:///home/saprilonty/repos/vercel-issue/webpack.common.ts), [webpack.dev.ts](file:///home/saprilonty/repos/vercel-issue/webpack.dev.ts) and [webpack.prod.ts](file:///home/saprilonty/repos/vercel-issue/webpack.prod.ts).
3. **Step 3 — Verification of Build Output:**
   - Execute `bun run build`.
   - Inspect [dist/index.html](file:///home/saprilonty/repos/vercel-issue/dist/index.html) to confirm:
     - `@layer reset, base, blocks, helpers;` is present and intact within `<style>`.
     - `pdf.worker.bundle.js` is NOT present in the HTML tags.
     - Extracted CSS is linked via `<link rel="stylesheet" href="...css">`.
4. **Step 4 — Verification of Development Server:** Run `bun start` and verify live page loading and style application.
5. **Step 5 — Dependency Pruning:** Run `bun remove` for the obsolete packages and regenerate `bun.lock`.
6. **Step 6 — Final Code Hygiene Audit:** Run `bun run test:ci` and `bun x tsc --noEmit` to ensure pristine repository health.
