import { test as setup, expect } from '@playwright/test';
import { getUser } from '../../src/config/environments.js';
import { ROUTES, STORAGE_STATE_PATH } from '../../src/config/constants.js';
import { LoginPage } from '../../src/pages/login.page.js';

/**
 * Global auth setup: logs in once as the environment's default user and
 * persists the session for every downstream project via storage state.
 * Reruns fresh on each CI shard group that needs it.
 */
setup('authenticate as default user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(getUser());

  await expect(page).toHaveURL(new RegExp(`${ROUTES.inventory.replace(/\//g, '\\/')}$`));

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
