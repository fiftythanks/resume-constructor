# Template React/JSX Repository

**React**:

- `react` — The core React library for building user interfaces.
- `react-dom` — Provides DOM-specific methods for rendering React components in the browser.
- `@babel/preset-react` — Enables Babel to understand JSX syntax.
- `@types/react` – TypeScript type definitions for React. (For VSCode IntelliSense.)
- `@types/react-dom` – TypeScript type definitions for ReactDOM. (For VSCode IntelliSense.)

**Linting and formatting:**

- `eslint` v8.57.1.
  - `eslint-config-airbnb` — Linting according to Airbnb's [JavaScript Style Guide](https://github.com/airbnb/javascript?tab=readme-ov-file) and [React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react).
  - `eslint-plugin-import` — This plugin intends to support linting of ES2015+ (ES6+) import/export syntax, and prevent issues with misspelling of file paths and import names. — Required for `eslint-config-airbnb`.
  - `eslint-import-resolver-webpack` — An `eslint-plugin-import` plugin. Enables ESLint to understand module resolution configured for webpack.
  - `eslint-plugin-react` — React-specific linting rules for ESLint. — Required for `eslint-config-airbnb`.
  - `eslint-plugin-jsx-a11y` — It does a static evaluation of the JSX to spot accessibility issues in React apps. — Required for `eslint-config-airbnb`.
  - `eslint-plugin-react-hooks` — It enforces the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks). — Required for `eslint-config-airbnb`.
  - `eslint-config-prettier` — Turns off all rules that are unnecessary or might conflict with Prettier.
  - `eslint-webpack-plugin` — Adds JS linting as a pre-build step.
- `prettier` v3.5.2 (`"singleQuote": true`).
- `husky` — Git hooks.
- `lint-staged` — Runs linters and formatters on staged files. — Relies on `husky`.
- `stylelint` — CSS linter.
  - `stylelint-config-sass-guidelines` — To lint Sass files (SCSS syntax) according to the [Sass Guidelines](https://sass-guidelin.es). (This plugin has some conflicting with Prettier rules. I turned off those rules that led to conflicts in my experience and didn't bring enough value to keep up with constantly needing to turn them off for one line/file.) — Relies on `postcss`.
  - `stylelint-config-concentric-order` — Validates the order of CSS properties according to [Concentric CSS](http://rhodesmill.org/brandon/2011/concentric-css/).
  - `stylelint-webpack-plugin` — Adds CSS linting as a pre-build step.

Instructions for building from scratch:

- “[Getting Started](https://eslint.org/docs/v8.x/use/getting-started)”, ESLint.
- [`eslint-config-airbnb`](https://www.npmjs.com/package/eslint-config-airbnb), npm.
- [`eslint-plugin-import`](https://www.npmjs.com/package/eslint-plugin-import), [`eslint-import-resolver-webpack`](https://www.npmjs.com/package/eslint-import-resolver-webpack), npm.
- “[Install](https://prettier.io/docs/install)”, Prettier.
- [`lint-staged`](https://github.com/lint-staged/lint-staged#configuration), lint-staged, GitHub.
- “[Getting Started](https://stylelint.io/user-guide/get-started)”, Stylelint.
- [`stylelint-config-sass-guidelines`](https://www.npmjs.com/package/stylelint-config-sass-guidelines), npm.

**webpack:**

- `webpack`
- `webpack-cli` — Command-line interface for running and configuring webpack.
- `html-webpack-plugin` — Generates an HTML file and automatically injects your bundled JavaScript.
- `style-loader` — Injects CSS into the DOM via `<style>` tags.
- `css-loader` — Interprets `@import` and `url()` in CSS and resolves them.
- `html-loader` — Handles assets used in HTML (like `<img src="./my-image.png" />`) in the same manner as `css-loader`.
- `webpack-dev-server` — Local development server with live reloading and hot module replacement (HMR).
- `webpack-merge` — Allows splitting webpack config (e.g. webpack.common.js, webpack.dev.js and webpack.prod.js).
- `clean-webpack-plugin` — Cleans the output directory (/dist) before each build to prevent outdated files.

Instructions for building from scratch:

- “[webpack](https://www.theodinproject.com/lessons/javascript-webpack)”, The Odin Project. — For basic webpack installation and configuration.
- “[Asset Management](https://webpack.js.org/guides/asset-management/)”, webpack. — For more information on asset management.
- “[Production](https://webpack.js.org/guides/production/)”, webpack. ­— For dividing webpack.config.js in three separate configs.
- [`clean-webpack-plugin`](https://www.npmjs.com/package/clean-webpack-plugin), npm.

**Babel:**

- `babel-loader` — A webpack loader that uses Babel to transpile JavaScript.
- `@babel/core` — The main Babel compiler.
- `@babel/preset-env` — Transpiles modern JavaScript to work in older environments based on browser support targets.

Instructions for building from scratch:

- “[What is ES6?](https://www.theodinproject.com/lessons/node-path-javascript-what-is-es6)”, The Odin Project.
- [`babel-loader`](https://github.com/babel/babel-loader), Babel, GitHub.

**Jest:**

- `jest`
- `babel-jest` — Transforms code using Babel before tests are executed.
- `@types/jest` — For VSCode IntelliSense.
- `jest-environment-jsdom`

Instructions for building from scratch:

- “[Getting Started](https://jestjs.io/docs/getting-started#using-babel)” (sections “[Generate a basic configuration file](https://jestjs.io/docs/getting-started#generate-a-basic-configuration-file)” and “[Using Babel](https://jestjs.io/docs/getting-started#using-babel)”), Jest.
- “[IntelliSense for Jest not working in VS code](https://stackoverflow.com/questions/57874114/IntelliSense-for-jest-not-working-in-vs-code)”, StackOverflow.
- “[DOM Manipulation](https://jestjs.io/docs/tutorial-jquery)”, Jest.

**Sass:**

- `sass-embedded`
- `sass-loader` — Loads a Sass/SCSS file and compiles it to CSS.

Instructions for building from scratch:

- [`sass-embedded`](https://sass-lang.com/install/), Sass.
- [`sass-loader`](https://webpack.js.org/loaders/sass-loader/#root), webpack.
- Architecture: “7-1”. Read more on [Sass Guidelines](https://sass-guidelin.es/#architecture).

**PostCSS:**

- `postcss`
- `postcss-loader` — webpack loader to process CSS with PostCSS.
- `autoprefixer` — Parses CSS and adds vendor prefixes to CSS rules using values from [Can I Use](https://caniuse.com/).

Instructions for building from scratch:

- [Setup](https://github.com/postcss/postcss#usage) (PostCSS, GitHub).
- [`autoprefixer`](https://github.com/postcss/autoprefixer), PostCSS, GitHub.

---

When using the template, you should remove all unnecessary webpack plugins for asset management.

I also configured some config files to work properly with .mjs extensions, so if you decide to use this template, you can use the .mjs extension with your ESM, even for tests .
