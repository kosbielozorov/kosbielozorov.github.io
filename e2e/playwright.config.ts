import {
  defineConfig,
  devices,
  type ReporterDescription,
} from '@playwright/test';
import { join } from 'node:path';
import { DEV_BASE_URL, env } from './app/constants/';

/**
 * Publishing results to Testomat.io is opt-in: the reporter is added only when
 * `TESTOMATIO` holds an API key. No key — no reporter, locally or on CI.
 * The key is unrelated to `TESTOMATIO_MCP_TOKEN`, which the MCP server uses.
 */
const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { open: env.CI ? 'never' : 'on-failure' }],
  ['junit', { outputFile: 'results.xml' }],
  ['./lib/slowStepReporter.ts'],
];

if (env.TESTOMATIO) {
  reporters.push([
    '@testomatio/reporter/playwright',
    { apiKey: env.TESTOMATIO },
  ]);
}

/**
 * Environment is loaded and validated in `app/constants/env.constants.ts`:
 * `.env` is resolved from the package root (not `process.cwd()`), every runner
 * setting has a default, and an invalid value fails fast instead of becoming `NaN`.
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/',
  testMatch: ['**/*.test.ts'],
  /* Characterization scaffolding runs nightly only — `playwright.characterization.config.ts`. */
  testIgnore: ['characterization/**'],
  /* Run tests in files in parallel */
  fullyParallel: env.FULLY_PARALLEL,
  timeout: env.CI ? env.TEST_TIMEOUT : 70 * 1000,
  /**
   * Maximum time expect() should wait for the condition to be met.
   * For example in `await expect(locator).toHaveText();`
   */
  expect: {
    timeout: env.CI ? env.EXPECT_TIMEOUT : 6000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: env.CI,
  /* Retry on CI only */
  retries: env.CI ? env.RETRIES : 0,
  retryStrategy: 'isolated',
  repeatEach: env.CI ? env.REPEAT : 1,
  /* Opt out of parallel tests on CI. */
  workers: env.CI ? env.WORKERS : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: reporters,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: DEV_BASE_URL,

    // actionTimeout: 10_000,
    navigationTimeout: 70_000,

    /* Collect artifacts based on environment */
    screenshot: env.CI ? 'only-on-failure' : 'on',
    video: env.CI ? env.VIDEO_RECORD : 'off',
    trace: env.CI ? env.TRACE_VALUE : 'on',
  },

  /* The portfolio site under test: the Vite dev server of the parent repo (`ai/project.md` → Legacy sources). */
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    /* Absolute: a config extending this one from another folder must still start the parent repo. */
    cwd: join(import.meta.dirname, '..'),
    url: DEV_BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },

  /* Browser projects: chromium for daily authoring/debug; firefox/webkit for cross-browser runs */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      /* WebKit on macOS moves Tab focus to form fields only (no "full keyboard access"), so Tab-order
       * tests (`@keyboard`) prove nothing there; Chromium runs them. */
      grepInvert: /@keyboard/,
    },
  ],
});
