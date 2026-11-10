import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './src/config/environments.js';
import { STORAGE_STATE_PATH, TIMEOUTS } from './src/config/constants.js';

const environment = getEnvironment();
const isCI = !!process.env.CI;

/**
 * Enterprise Playwright configuration.
 *
 * Projects:
 *   setup        — global authentication, persists storage state
 *   chromium     — desktop Chrome (primary CI target)
 *   firefox      — desktop Firefox (nightly matrix)
 *   webkit       — desktop Safari (nightly matrix)
 *   mobile-chrome— Pixel 7 viewport (responsive coverage)
 *
 * CI shards emit blob reports merged by `npx playwright merge-reports`.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 1 : '75%',

  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['blob', { outputDir: 'blob-report' }],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
      ],

  use: {
    baseURL: environment.baseUrl,
    testIdAttribute: 'data-test', 
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: TIMEOUTS.default,
    navigationTimeout: TIMEOUTS.slow,
    locale: 'en-US',
    timezoneId: 'UTC',
  },

  expect: {
    timeout: TIMEOUTS.default,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ['setup'],
    },
  ],
});
