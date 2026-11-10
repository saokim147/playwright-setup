import { test, expect } from '../../../src/fixtures/index.js';
import { ROUTES, TIMEOUTS } from '../../../src/config/constants.js';

test.describe('Logout', () => {
  test('user can log out from the header menu @smoke', async ({ header, page }) => {
    await page.goto(ROUTES.inventory);
    await page.getByTestId('title').waitFor({ timeout: TIMEOUTS.default });

    await header.logout();

    await expect(page).toHaveURL(/.*\/(index\.html)?\??.*$/);
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('session ends — inventory requires re-login after logout', async ({ header, loginPage, page }) => {
    await page.goto(ROUTES.inventory);
    await header.logout();

    // Direct navigation to a protected route bounces back to login.
    await page.goto(ROUTES.inventory);
    await page.waitForURL(/.*\/(index\.html)?$/, { timeout: TIMEOUTS.default });
    await loginPage.expectLoginFormVisible();
  });
});
