import type { Locator, Page } from '@playwright/test';
import type { CartItem } from '../types/index.js';
import { productIdFromName } from '../data/products.js';
import { ROUTES, TIMEOUTS } from '../config/constants.js';
import { Logger } from '../utils/logger.js';
import { BasePage } from './base.page.js';

export class CartPage extends BasePage {
  readonly title: Locator;
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartList = page.getByTestId('cart-list');
    this.cartItems = this.cartList.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async open(): Promise<this> {
    await this.goto(ROUTES.cart);
    await this.title.waitFor({ state: 'visible', timeout: TIMEOUTS.default });
    return this;
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItems(): Promise<CartItem[]> {
    const names = (await this.cartItems
      .getByTestId('inventory-item-name')
      .allTextContents()) as string[];

    const priceTexts = (await this.cartItems
      .getByTestId('inventory-item-price')
      .allTextContents()) as string[];
    return names.map((name, i) => ({ name, price: parseFloat(priceTexts[i]!.replace('$', '')) }));
  }

  async removeItem(name: string): Promise<void> {
    await Logger.step('CartPage', `remove from cart: ${name}`, async () => {
      await this.page.getByTestId(`remove-${productIdFromName(name)}`).click();
    });
  }

  async proceedToCheckout(): Promise<void> {
    await Logger.step('CartPage', 'proceed to checkout', async () => {
      await this.checkoutButton.click();
      await this.page.waitForURL(`**${ROUTES.checkoutStepOne}`, { timeout: TIMEOUTS.default });
    });
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.page.waitForURL(`**${ROUTES.inventory}`, { timeout: TIMEOUTS.default });
  }

  async expectEmpty(): Promise<void> {
    await this.cartItems.first().waitFor({ state: 'detached', timeout: TIMEOUTS.short });
  }
}
