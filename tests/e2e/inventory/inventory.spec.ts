import { test, expect } from '../../../src/fixtures/index.js';
import { products } from '../../../src/data/products.js';
import { INVENTORY_PRODUCT_COUNT, ROUTES, TIMEOUTS } from '../../../src/config/constants.js';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('displays the full product catalog @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.inventoryItems).toHaveCount(INVENTORY_PRODUCT_COUNT);
  });

  test('catalog names and prices match expected data', async ({ inventoryPage }) => {
    const names = await inventoryPage.getProductNames();
    const prices = await inventoryPage.getProductPrices();

    for (const product of products) {
      expect(names).toContain(product.name);
      expect(prices).toContain(product.price);
    }
  });

  test('adding an item updates the cart badge', async ({ inventoryPage, header }) => {
    await inventoryPage.addItem(products[0]!.name);

    await expect(header.cartBadge).toBeVisible();
    expect(await header.getCartCount()).toBe(1);
  });

  test('add and remove an item returns badge to zero', async ({ inventoryPage, header }) => {
    const product = products[1]!;

    await inventoryPage.addItem(product.name);
    await inventoryPage.removeItem(product.name);

    await expect(header.cartBadge).toBeHidden();
  });

  test('every product exposes an add-to-cart control', async ({ inventoryPage }) => {
    const buttons = inventoryPage.inventoryItems.getByTestId(/^(add-to-cart|remove)/);
    await expect(buttons).toHaveCount(INVENTORY_PRODUCT_COUNT);
  });

  test('item button toggles to remove after adding', async ({ inventoryPage }) => {
    const product = products[2]!;

    await inventoryPage.addItem(product.name);

    const buttons = inventoryPage.inventoryItems.getByTestId(/^(add-to-cart|remove)-/);
  });
});
