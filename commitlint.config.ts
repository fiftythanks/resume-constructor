export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'british-english': ({ raw }: { raw: string }) => {
          const americanPatterns = [
            /\boptimiz(e|ed|es|ing|ation|ations)\b/i,
            /\binitializ(e|ed|es|ing|ation|ations)\b/i,
            /\bbehavior(s)?\b/i,
            /\bcustomiz(e|ed|es|ing|ation|ations)\b/i,
            /\bprioritiz(e|ed|es|ing|ation|ations)\b/i,
            /\bsynchroniz(e|ed|es|ing|ation|ations)\b/i,
            /\borganiz(e|ed|es|ing|ation|ations)\b/i,
          ];
          for (const pattern of americanPatterns) {
            const match = raw.match(pattern);
            if (match) {
              return [
                false,
                `Commit message contains American spelling ("${match[0]}"). Use British English.`,
              ];
            }
          }
          return [true];
        },
      },
    },
  ],
  rules: {
    'british-english': [2, 'always'],
    'body-max-line-length': [2, 'always', 80],
    'header-max-length': [2, 'always', 50],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      [
        'addsections',
        'agents',
        'app',
        'applayout',
        'certifications',
        'ci',
        'components',
        'docs',
        'e2e',
        'education',
        'eslint',
        'experience',
        'hooks',
        'husky',
        'links',
        'navbar',
        'package',
        'pages',
        'personal',
        'playwright',
        'prettier',
        'preview',
        'projects',
        'readme',
        'sidebar',
        'skills',
        'stylelint',
        'styles',
        'toolbar',
        'ts',
        'types',
        'utils',
        'vite',
        'vitest',
      ],
    ],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'docs', 'chore'],
    ],
  },
};
