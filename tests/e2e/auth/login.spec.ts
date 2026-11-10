import { test, expect } from '../../../src/fixtures/index.js';
import { users } from '../../../src/data/users.js';
import { ROUTES } from '../../../src/config/constants.js';

test.describe('Login', () => {
  test('standard user can log in @smoke', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard);

    await expect(loginPage.page).toHaveURL(new RegExp(`${ROUTES.inventory.replace(/\//g, '\\/')}$`));
  });

  test('locked out user sees a lockout error', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.loginExpectingFailure(users.lockedOut);

    await expect.soft(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
  });

  test('empty credentials show validation errors', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('missing password shows password validation error', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.usernameInput.fill(users.standard.username);
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

  test('error message can be dismissed', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.loginButton.click();
    await loginPage.errorMessage.waitFor({ state: 'visible' });

    await loginPage.closeError();
    await expect(loginPage.errorMessage).toBeHidden();
  });
});
