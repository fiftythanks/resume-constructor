import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    css: false,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'docs/**', 'e2e/**'],
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    testTimeout: 25_000,
  },
});
