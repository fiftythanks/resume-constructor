/** @type {import('stylelint').Config} */
const config = {
  extends: [
    'stylelint-config-sass-guidelines',
    'stylelint-config-concentric-order',
  ],
  rules: {
    /* This rule conflicts with Prettier */
    '@stylistic/function-parentheses-space-inside': null,
    'max-nesting-depth': 2,
  },
};

module.exports = config;
