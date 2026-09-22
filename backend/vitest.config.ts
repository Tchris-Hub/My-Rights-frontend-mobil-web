import { defineConfig } from 'vitest/config';

// Backend tests are integration tests against Neon (network round-trips), so a
// generous per-test timeout is warranted.
export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
