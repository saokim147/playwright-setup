import { test, expect } from '../../../src/fixtures/index.js';
import { invalidCheckoutInfos } from '../../../src/data/factories/checkout.factory.js';
import { products } from '../../../src/data/products.js';
import { ROUTES } from '../../../src/config/constants.js';

test.describe('Checkout — step one validation', () => {
  for (const { label, info, error } of invalidCheckoutInfos()) {
    test(`shows error for ${label}`, async ({ page, checkoutPage }) => {
      await page.goto(ROUTES.inventory);
      await page.getByTestId(/^add-to-cart-/).first().click();
      await page.getByTestId('shopping-cart-link').click();
      await page.getByTestId('checkout').click();

      await checkoutPage.submitInvalidInfo(info);

      expect(await checkoutPage.getErrorText()).toBe(error);
    });
  }

  test('error banner dismisses and form stays usable', async ({ page, checkoutPage }) => {
    await page.goto(ROUTES.inventory);
    await page.getByTestId(/^add-to-cart-/).first().click();
    await page.getByTestId('shopping-cart-link').click();
    await page.getByTestId('checkout').click();

    await checkoutPage.submitInvalidInfo({});
    await checkoutPage.errorMessage.getByRole('button').click();
    await expect(checkoutPage.errorMessage).toBeHidden();
    await expect(checkoutPage.continueButton).toBeEnabled();
  });
});
