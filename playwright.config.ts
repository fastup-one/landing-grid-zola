import { defineConfig, devices } from '@playwright/test';

// Browser behavior gate. Serves the built site (public/) and drives it in
// headless Chromium. Uses the system Chromium via CHROMIUM/executablePath so no
// browser download is needed. Build the site first: `make build-local`.
const PORT = 8080;
const chromium = process.env.CHROMIUM || undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: chromium ? { executablePath: chromium } : {},
      },
    },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} --directory public --bind 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
