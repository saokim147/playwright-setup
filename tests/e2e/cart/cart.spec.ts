import { test, expect } from '../../../src/fixtures/index.js';
import { products } from '../../../src/data/products.js';
import { ROUTES } from '../../../src/config/constants.js';

test.describe('Cart', () => {
  test('added items appear in the cart with correct prices @smoke', async ({
    inventoryPage,
    cartPage,
    header,
    page,
  }) => {
    await page.goto(ROUTES.inventory);
    await inventoryPage.addItem(products[0]!.name);
    await inventoryPage.addItem(products[3]!.name);

    await header.openCart();
    await cartPage.title.waitFor();

    const items = await cartPage.getItems();
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.name)).toEqual(
      expect.arrayContaining([products[0]!.name, products[3]!.name]),
    );
    for (const item of items) {
      const expected = products.find((p) => p.name === item.name)!.price;
      expect(item.price).toBe(expected);
    }
  });

  test('item can be removed from the cart', async ({ inventoryPage, cartPage, header, page }) => {
    await page.goto(ROUTES.inventory);
    await inventoryPage.addItem(products[2]!.name);

    await header.openCart();
    await cartPage.removeItem(products[2]!.name);

    await cartPage.expectEmpty();
  });

  test('cart contents persist across reload', async ({ inventoryPage, cartPage, header, page }) => {
    await page.goto(ROUTES.inventory);
    await inventoryPage.addItem(products[1]!.name);
    await inventoryPage.addItem(products[4]!.name);

    await header.openCart();
    await page.reload();

    expect(await cartPage.getItemCount()).toBe(2);
    await expect(header.cartBadge).toHaveText('2');
  });

  test('continue shopping returns to inventory', async ({ inventoryPage, cartPage, header, page }) => {
    await page.goto(ROUTES.inventory);
    await inventoryPage.addItem(products[0]!.name);

    await header.openCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.inventory.replace(/\//g, '\\/')}$`));
  });

  test('cart badge count matches distinct added items', async ({ inventoryPage, header, page }) => {
    await page.goto(ROUTES.inventory);
    await inventoryPage.addItem(products[0]!.name);
    await inventoryPage.addItem(products[1]!.name);
    await inventoryPage.addItem(products[5]!.name);

    expect(await header.getCartCount()).toBe(3);
  });
});
