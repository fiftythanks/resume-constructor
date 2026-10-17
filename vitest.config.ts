import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

const isJsonReporter =
  process.argv.some((arg) => arg.includes('json')) ||
  process.env.VITEST_MCP_OPTIMIZED === '1';

export default mergeConfig(
  viteConfig,
  defineConfig({
    optimizeDeps: {
      include: ['react-dom/client', 'vitest-browser-react'],
    },
    test: {
      clearMocks: true,
      globals: true,
      ...(isJsonReporter ? { reporters: [['json', { stdout: true }]] } : {}),
      projects: [
        {
          extends: true,
          test: {
            environment: 'node',
            exclude: ['src/**/use*.test.ts', 'src/**/*.browser.test.ts'],
            include: ['src/**/[a-z]*.test.ts'],
            name: 'unit',
          },
        },
        {
          extends: true,
          test: {
            environment: 'happy-dom',
            exclude: ['src/**/*.browser.test.{ts,tsx}'],
            include: [
              'src/**/[A-Z]*.test.{ts,tsx}',
              'src/**/use*.test.{ts,tsx}',
            ],
            name: 'component',
            setupFiles: ['./vitest.setup.tsx'],
          },
        },
        {
          extends: true,
          test: {
            browser: {
              enabled: true,
              headless: true,
              instances: [{ browser: 'chromium' }],
              provider: playwright(),
            },
            include: ['src/**/*.browser.test.{ts,tsx}'],
            name: 'browser',
            setupFiles: ['./vitest.setup.tsx'],
            testTimeout: 25_000,
          },
        },
      ],
    },
  }),
);
