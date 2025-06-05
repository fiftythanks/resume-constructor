/** @type {import('stylelint').Config} */
const config = {
  extends: [
    'stylelint-config-sass-guidelines',
    'stylelint-config-concentric-order',
  ],
  rules: {
    /* This rule conflicts with Prettier */
    '@stylistic/function-parentheses-space-inside': null,
    'max-nesting-depth': 3,
    'selector-class-pattern': null,
  },
};

module.exports = config;
