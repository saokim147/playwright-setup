import { test, expect } from '../../../src/fixtures/index.js';
import { createCheckoutInfo } from '../../../src/data/factories/checkout.factory.js';
import { products } from '../../../src/data/products.js';
import { TAX_RATE } from '../../../src/config/constants.js';
import { ROUTES } from '../../../src/config/constants.js';

test.describe('Checkout — full 3-step flow', () => {
  test('completes purchase from cart to confirmation @smoke', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
    header,
  }) => {
    const selected = [products[0]!, products[2]!, products[3]!];
    const info = createCheckoutInfo();
    const expectedSubtotal =
      Math.round(selected.reduce((sum, p) => sum + p.price, 0) * 100) / 100;

    // Step 0 — build the cart
    await page.goto(ROUTES.inventory);
    for (const product of selected) {
      await inventoryPage.addItem(product.name);
    }
    await header.openCart();

    // Step 1 — shipping information
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(info);

    // Step 2 — order overview
    expect(await checkoutPage.getSummaryItemNames()).toEqual(
      expect.arrayContaining(selected.map((p) => p.name)),
    );
    const subtotal = await checkoutPage.getSubtotal();
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(await checkoutPage.getTax()).toBeCloseTo(subtotal * TAX_RATE, 1);
    expect(await checkoutPage.getTotal()).toBeCloseTo(
      subtotal + Math.round(subtotal * TAX_RATE * 100) / 100,
      2,
    );

    // Step 3 — confirmation
    await checkoutPage.finish();
    expect(await checkoutPage.getConfirmationText()).toBe('Thank you for your order!');

    await checkoutPage.backToInventory();
    expect(await header.getCartCount()).toBe(0);
  });

  test('cancel from step one returns to cart with items intact', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await page.goto(ROUTES.inventory);
    await inventoryPage.addItem(products[0]!.name);

    await inventoryPage.page.getByTestId('shopping-cart-link').click();
    await cartPage.proceedToCheckout();
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.cart.replace(/\//g, '\\/')}$`));
    expect(await page.getByTestId('shopping-cart-badge').textContent()).toBe('1');
  });
});
