import path from 'node:path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    tsconfigPaths: true,
  },
  server: {
    host: true,
  },
});
