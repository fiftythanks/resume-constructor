/** @type {import('stylelint').Config} */
const config = {
  extends: [
    'stylelint-config-sass-guidelines',
    'stylelint-config-concentric-order',
  ],
  ignoreFiles: [
    'dist/**',
    '**/dist/**',
    '**/.astro/**',
    'node_modules/**',
    '**/node_modules/**',
  ],
  rules: {
    // These rules conflict with Prettier
    '@stylistic/function-parentheses-space-inside': null,
    '@stylistic/indentation': null,

    'max-nesting-depth': 3,
    'scss/percent-placeholder-pattern': null,
    'selector-class-pattern': null,
  },
};

export default config;
