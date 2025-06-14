/** @type {import('stylelint').Config} */
const config = {
  extends: [
    'stylelint-config-sass-guidelines',
    'stylelint-config-concentric-order',
  ],
  rules: {
    // These rules conflict with Prettier
    '@stylistic/function-parentheses-space-inside': null,
    '@stylistic/indentation': null,

    'max-nesting-depth': 3,
    'selector-class-pattern': null,
  },
};

module.exports = config;
