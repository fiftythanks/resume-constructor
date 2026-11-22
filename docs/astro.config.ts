import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import { defineConfig } from 'astro/config';
import starlightGithubAlerts from 'starlight-github-alerts';
import starlightLinksValidator from 'starlight-links-validator';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightPageActions from 'starlight-page-actions';
import starlightScrollToTop from 'starlight-scroll-to-top';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';

export default defineConfig({
  site: 'https://docs.resume-constructor.sholokhov.dev',
  integrations: [
    mermaid(),
    starlight({
      title: 'Resume Constructor',
      description: 'Developer guides and API reference for Resume Constructor.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/fiftythanks/resume-constructor',
        },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [{ label: 'Getting Started', slug: 'getting-started' }],
        },
        {
          label: 'Architecture Guides',
          items: [
            {
              label: 'System Architecture',
              slug: 'guides/architecture',
            },
            {
              label: 'Form Engineering',
              slug: 'guides/form-engineering',
            },
            {
              label: 'Rendering Pipeline',
              slug: 'guides/preview-rendering',
            },
            {
              label: 'Inclusive Design & A11y',
              slug: 'guides/accessibility',
            },
            {
              label: 'Project Roadmap',
              slug: 'guides/roadmap',
            },
          ],
        },
        typeDocSidebarGroup,
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/**/*.ts', '../src/**/*.tsx'],
          pagination: true,
          tsconfig: '../tsconfig.json',
          typeDoc: {
            entryPointStrategy: 'expand',
            exclude: ['**/*.test.*', '**/*.test-d.ts', '**/*.d.ts'],
            excludeInternal: false,
            enumMembersFormat: 'table',
            parametersFormat: 'table',
            propertiesFormat: 'table',
            typeDeclarationFormat: 'table',
          },
        }),
        starlightGithubAlerts(),
        starlightLinksValidator({
          exclude: ['/api/**'],
        }),
        starlightLlmsTxt(),
        starlightPageActions(),
        starlightScrollToTop(),
      ],
    }),
  ],
});
