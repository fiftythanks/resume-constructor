/* eslint-disable import-x/no-named-as-default-member */
import js from '@eslint/js';
import json from '@eslint/json';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import pluginJest from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nodePlugin from 'eslint-plugin-n';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import * as reactHooks from 'eslint-plugin-react-hooks';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  {
    ignores: ['dist/**', '.github/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      js,
      react,
      reactHooks,
      jsxA11y,
      n: nodePlugin,
      'import-x': importX,
      '@typescript-eslint': tseslint.plugin,
    },
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      tseslint.configs.recommended,
      importX.configs['flat/recommended'],
      nodePlugin.configs['flat/recommended'],
      perfectionist.configs['recommended-natural'],
      reactHooks.configs['recommended-latest'],
      reactYouMightNotNeedAnEffect.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2026,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'import-x/no-dynamic-require': 'warn',
      'import-x/no-nodejs-modules': 'off',
      'block-scoped-var': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eol-last': 'error',
      'prefer-arrow-callback': 'error',
      'no-trailing-spaces': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-warning-comments': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'n/no-missing-import': 'off',
      'n/no-empty-function': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-missing-require': 'off',
      'n/shebang': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-unpublished-require': 'off',
      'n/no-extraneous-import': 'off',
      'no-dupe-class-members': 'off',
      'require-atomic-updates': 'off',

      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          version: '>=22.16.0',
        },
      ],

      'n/no-unsupported-features/es-builtins': [
        'error',
        {
          version: '>=22.16.0',
        },
      ],

      eqeqeq: 'error',
      quotes: ['warn', 'single', { avoidEscape: true }],

      'no-restricted-properties': [
        'error',
        {
          object: 'describe',
          property: 'only',
        },
        {
          object: 'it',
          property: 'only',
        },
      ],

      /**
       * - Explicit labelling is the surest way to make labels work as intended.
       * - Implicit labels may not work properly with some assistive
       *   technologies.
       * - Asserting both types of labelling is redundant.
       *
       * Read: https://stackoverflow.com/a/63932559/28655439.
       */
      'jsx-a11y/label-has-associated-control': [
        2,
        {
          asserts: 'htmlFor',
        },
      ],

      /**
       * To ensure `eslint-plugin-import-x` doesn't conflict with
       * `eslint-plugin-perfectionist`.
       */
      'import-x/order': 'off',

      'perfectionist/sort-imports': [
        'error',
        {
          customGroups: [
            {
              elementNamePattern: ['^react$', '^react-dom$'],
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

            {
              elementNamePattern: '^@/hooks/.*',
              groupName: 'hooks',
            },
          ],

          groups: [
            'react',
            'builtin',
            'external',
            'hooks',
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

      /**
       * Doesn't allow to declare functions that are used inside components
       * before the components if the names of the functions are farther in
       * the alphabet.
       */
      'perfectionist/sort-modules': 'off',

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

      'react/prop-types': [0],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
          project: 'tsconfig.json',
        }),
        createNodeResolver(),
      ],
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.mts', '.ts', '.tsx'],
      },
      react: {
        version: 'detect',
      },
    },
  },
  {
    // disable type-aware linting on JS files
    files: ['**/*.{mjs,js,jsx}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.{test,spec}.{mjs,js,jsx,mts,ts,tsx}'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    extends: [
      pluginJest.configs['flat/recommended'],
      pluginJest.configs['flat/style'],
    ],
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: [json.configs.recommended],
  },
  eslintConfigPrettier,
]);
