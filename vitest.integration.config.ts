import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.spec.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/__tests__/**'],
    testTimeout: 30000, // Increased timeout for integration tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/e2e/**',
        '**/__tests__/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/mocks/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
