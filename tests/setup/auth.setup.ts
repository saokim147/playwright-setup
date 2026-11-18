import { test as setup, expect } from '@playwright/test';
import { getUser } from '../../src/config/environments.js';
import { ROUTES, STORAGE_STATE_PATH } from '../../src/config/constants.js';
import { LoginPage } from '../../src/pages/login.page.js';

setup('authenticate as default user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(getUser());

  await expect(page).toHaveURL(new RegExp(`${ROUTES.inventory.replace(/\//g, '\\/')}$`));

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
