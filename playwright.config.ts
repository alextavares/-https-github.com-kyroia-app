import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3025',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
    // Add extra HTTP headers for testing
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PW_DISABLE_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev:3025',
        url: process.env.BASE_URL || 'http://localhost:3025',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
