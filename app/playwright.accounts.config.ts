import { defineConfig, devices } from "@playwright/test";

/**
 * Accounts end-to-end tests: the app built in "accounts" mode against the LOCAL Supabase stack
 * (cd ../backend && npm run db:start). Real one-time codes from Mailpit; fictional people only.
 *   npm run test:accounts
 */
export default defineConfig({
  testDir: "./tests-accounts",
  timeout: 240_000,
  workers: 1,
  outputDir: "test-results-accounts",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-accounts" }]],
  globalSetup: "./tests-accounts/global-setup.ts",
  use: {
    ...devices["Pixel 7"],
    baseURL: "http://localhost:4175",
    locale: "th-TH",
    timezoneId: "Asia/Bangkok",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build:accounts && npx vite preview --mode accounts --outDir dist-accounts --port 4175 --strictPort",
    url: "http://localhost:4175",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
