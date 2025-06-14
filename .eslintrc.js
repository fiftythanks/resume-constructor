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
  env: {
    browser: true,
    es2024: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'prettier',
    'plugin:import/recommended',
    'plugin:perfectionist/recommended-natural-legacy',
  ],
  ignorePatterns: ['webpack.*.js', 'dist', '**/*.test.mjs'] /* [1] */,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['import', 'perfectionist'],
  rules: {
    /**
     * To ensure `eslint-plugin-import` doesn't conflict with
     * `eslint-plugin-perfectionist`.
     */
    'import/order': 'off',

    'perfectionist/sort-imports': [
      'error',
      {
        customGroups: [
          {
            elementNamePattern: ['react', 'react-dom'],
            groupName: 'react',
          },
          {
            elementNamePattern: '^@/layout/.*',
            groupName: 'layout',
          },
          {
            elementNamePattern: '^@/pages/.*',
            groupName: 'pages',
          },
          {
            elementNamePattern: '^@/components/.*',
            groupName: 'components',
          },
          {
            elementNamePattern: '^@/utils/.*',
            groupName: 'utils',
          },
          {
            elementNamePattern: '^@/assets/.*',
            groupName: 'assets',
          },
        ],

        groups: [
          'react',
          'builtin',
          'external',
          'layout',
          'pages',
          'components',
          'utils',
          ['parent', 'sibling', 'index'],

          // Images, icons etc.
          'assets',

          'style',
          'type',
          'unknown',
        ],
      },
    ],

    'perfectionist/sort-jsx-props': [
      'error',
      {
        customGroups: [
          {
            elementNamePattern: '^on[A-Z].+',
            groupName: 'callback',
          },
        ],
        groups: ['shorthand-prop', 'unknown', 'callback', 'multiline-prop'],
      },
    ],

    // Can't configure it to my needs, brings more bad than good.
    'perfectionist/sort-objects': 'off',

    'react/jsx-no-bind': [
      2,
      {
        allowArrowFunctions: true,
        allowBind: false,
        allowFunctions: true,
        ignoreDOMComponents: true,
        ignoreRefs: false,
      },
    ],

    /**
     * This rule should be deprecated since React deprecated PropTypes in April
     * 2017.
     */
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
