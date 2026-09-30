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
      description:
        'Technical architecture, zero-bootstrap engineering and API reference.',
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
          entryPoints: [
            '../src/types/resumeData.ts',
            '../src/types/ReadonlyExcept.ts',
            '../src/hooks/useAppState.ts',
            '../src/hooks/useDebouncedWindowSize.ts',
            '../src/hooks/useLastComponentBeforeTabpanel.ts',
            '../src/hooks/useResumeData/index.ts',
            '../src/utils/capitalize.ts',
            '../src/utils/neverReached.ts',
            '../src/utils/possibleSectionIds.ts',
            '../src/utils/sectionTitles.ts',
            '../src/components/Button/index.tsx',
            '../src/components/Popup/index.tsx',
            '../src/components/AddSections/index.tsx',
            '../src/components/AppbarIconButton/index.tsx',
            '../src/components/AppLayout/index.tsx',
            '../src/components/BulletPoints/index.tsx',
            '../src/components/Preview/index.tsx',
            '../src/pages/Personal/index.tsx',
            '../src/pages/Education/index.tsx',
            '../src/pages/Experience/index.tsx',
            '../src/pages/Projects/index.tsx',
            '../src/pages/Skills/index.tsx',
            '../src/pages/Certifications/index.tsx',
            '../src/pages/Links/index.tsx',
          ],
          pagination: true,
          tsconfig: '../tsconfig.json',
          typeDoc: {
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
