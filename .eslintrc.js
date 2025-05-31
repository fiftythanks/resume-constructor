/**
 * [1]: test files are ignored because you need to specify the jsdom
 * environment for UI tests , and you can only do this in the form of JSDoc-like
 * comments that triggers eslint-plugin-jsdoc.
 *
 * Instead of turning off ESLint for all tests, it is possible to turn off the
 * plugin's `check-tag-names` rule. But I figured that check-tag-names is more
 * important than linting test files.
 */

module.exports = {
  extends: ['airbnb', 'airbnb/hooks', 'prettier', 'plugin:import/recommended'],
  plugins: ['import'],
  ignorePatterns: ['webpack.*.js', 'dist', '**/*.test.mjs'] /* [1] */,
  env: {
    browser: true,
    es2024: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // This rule should be deprecated since React deprecated PropTypes in April 2017.
    'react/prop-types': [0],
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.common.js',
      },
    },
  },
};
