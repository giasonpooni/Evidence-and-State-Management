import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Two environments, chosen by file location:
//   src/**/*.test.ts   — pure modules (selectors, adapters, fixtures): node
//   src/**/*.test.tsx  — components and screens: jsdom + Testing Library
//
// This was `environmentMatchGlobs`, which Vitest 4 removed. A project per
// environment is the replacement and says the same thing: the two suites are
// the same suite run two ways, so each extends this file rather than restating
// the alias, the JSX transform, the globals and the timeout. Splitting those
// would be the drift the old config avoided by having one list.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 20000,
    projects: [
      { extends: true, test: { name: 'node', environment: 'node', include: ['src/**/*.test.ts'] } },
      { extends: true, test: { name: 'jsdom', environment: 'jsdom', include: ['src/**/*.test.tsx'] } },
    ],
  },
});
