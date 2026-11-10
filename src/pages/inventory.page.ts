import type { Locator, Page } from '@playwright/test';
import type { SortOption } from '../types/index.js';
import { productIdFromName } from '../data/products.js';
import { INVENTORY_PRODUCT_COUNT, ROUTES, SORT_VALUES, TIMEOUTS } from '../config/constants.js';
import { Logger } from '../utils/logger.js';
import { BasePage } from './base.page.js';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.inventoryItems = page.getByTestId('inventory-list').getByTestId('inventory-item');
  }

  async open(): Promise<this> {
    await this.goto(ROUTES.inventory);
    await this.title.waitFor({ state: 'visible', timeout: TIMEOUTS.slow });
    return this;
  }

  itemByName(name: string): Locator {
    return this.inventoryItems.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async addItem(name: string): Promise<void> {
    await Logger.step('InventoryPage', `add to cart: ${name}`, async () => {
      await this.page.getByTestId(`add-to-cart-${productIdFromName(name)}`).click();
    });
  }

  async removeItem(name: string): Promise<void> {
    await Logger.step('InventoryPage', `remove from cart: ${name}`, async () => {
      await this.page.getByTestId(`remove-${productIdFromName(name)}`).click();
    });
  }

  async isItemInCart(name: string): Promise<boolean> {
    return this.page.getByTestId(`remove-${productIdFromName(name)}`).isVisible();
  }

  /** Apply a sort option and wait for the re-ordered list to render. */
  async sortBy(option: SortOption): Promise<void> {
    await Logger.step('InventoryPage', `sort by ${option}`, async () => {
      await this.sortDropdown.selectOption(SORT_VALUES[option]);
      await this.page.waitForTimeout(250); // allow re-render to settle
    });
  }

  async getProductNames(): Promise<string[]> {
    return this.inventoryItems
      .getByTestId('inventory-item-name')
      .allTextContents() as Promise<string[]>;
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.inventoryItems.getByTestId('inventory-item-price').allTextContents();
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }

  async getProductCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async expectLoaded(): Promise<void> {
    const count = await this.getProductCount();
    if (count !== INVENTORY_PRODUCT_COUNT) {
      throw new Error(`Expected ${INVENTORY_PRODUCT_COUNT} products, found ${count}`);
    }
  }
}
