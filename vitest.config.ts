import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      clearMocks: true,
      css: false,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'docs/**', 'e2e/**'],
      globals: true,
      setupFiles: ['./vitest.setup.tsx'],
      testTimeout: 25_000,
    },
  }),
);
