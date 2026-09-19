import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 45000,
  use: { baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:4321', headless: true },
  reporter: [['list'], ['json', { outputFile: 'reports/playwright.json' }]],
});
