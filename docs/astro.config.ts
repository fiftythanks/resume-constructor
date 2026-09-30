import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightGithubAlerts from 'starlight-github-alerts';
import starlightLinksValidator from 'starlight-links-validator';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightPageActions from 'starlight-page-actions';
import starlightScrollToTop from 'starlight-scroll-to-top';

export default defineConfig({
  site: 'https://docs.resume-constructor.sholokhov.dev',
  integrations: [
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
      ],
      plugins: [
        starlightGithubAlerts(),
        starlightLinksValidator(),
        starlightLlmsTxt(),
        starlightPageActions(),
        starlightScrollToTop(),
      ],
    }),
  ],
});
