import { test, expect } from '../../../src/fixtures/index.js';
import { ascendingPrices, products, sortedNames } from '../../../src/data/products.js';
import type { SortOption } from '../../../src/types/index.js';

const cases: { option: SortOption; label: string }[] = [
  { option: 'name-asc', label: 'name A → Z' },
  { option: 'name-desc', label: 'name Z → A' },
  { option: 'price-asc', label: 'price low → high' },
  { option: 'price-desc', label: 'price high → low' },
];

test.describe('Inventory sorting', () => {
  for (const { option, label } of cases) {
    test(`sorts by ${label} @smoke`, async ({ inventoryPage }) => {
      await inventoryPage.open();
      await inventoryPage.sortBy(option);

      const names = await inventoryPage.getProductNames();
      expect(names).toEqual(sortedNames[option]);
    });
  }

  test('price low → high yields ascending prices', async ({ inventoryPage }) => {
    await inventoryPage.open();
    await inventoryPage.sortBy('price-asc');

    const prices = await inventoryPage.getProductPrices();
    expect(prices).toEqual(ascendingPrices);
  });

  test('sort selection resets to default after reload', async ({ inventoryPage }) => {
    await inventoryPage.open();
    await inventoryPage.sortBy('price-desc');
    await inventoryPage.page.reload();

    const names = await inventoryPage.getProductNames();
    expect(names).toEqual(sortedNames['name-asc']);
  });
});
