import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: /.*\.spec\.(ts|js)$/,
  timeout: 30_000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['dot']],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
});
