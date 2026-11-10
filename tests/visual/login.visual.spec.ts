import { test, expect } from '../../src/fixtures/index.js';
import { LoginPage } from '../../src/pages/login.page.js';
import { ROUTES } from '../../src/config/constants.js';

/**
 * Visual regression: screenshot baseline comparison.
 * Chromium-only — cross-browser rendering differences would require
 * per-browser baselines (see nightly-regression workflow).
 */
test.skip(({ browserName }) => browserName !== 'chromium', 'Visual baselines are Chromium-only');

test.describe('Login page visuals', () => {
  test('login form matches baseline @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('login error state matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginButton.click();
    await loginPage.errorMessage.waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('login-error-state.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });
});
