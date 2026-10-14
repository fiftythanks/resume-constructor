import { playwright } from '@vitest/browser-playwright';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    optimizeDeps: {
      include: ['react-dom/client'],
    },
    test: {
      browser: {
        enabled: true,
        headless: true,
        instances: [{ browser: 'chromium' }],
        provider: playwright(),
      },
      clearMocks: true,
      exclude: [...configDefaults.exclude, 'docs/**', 'e2e/**'],
      globals: true,
      setupFiles: ['./vitest.setup.tsx'],
      testTimeout: 25_000,
    },
  }),
);
