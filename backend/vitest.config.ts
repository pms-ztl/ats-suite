import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-key-for-vitest',
      JWT_ISSUER: 'ats-test',
      JWT_AUDIENCE: 'ats-test',
    },
    exclude: ['node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      exclude: ['node_modules/', 'dist/', 'src/tests/'],
    },
    testTimeout: 15000,
    server: {
      deps: {
        // Inline ALL node_modules so Vitest transforms ESM-only packages in the Node environment
        inline: [/.*/],
      },
    },
  },
});
