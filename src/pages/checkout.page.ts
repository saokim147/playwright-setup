import type { Locator, Page } from '@playwright/test';
import type { CheckoutInfo } from '../types/index.js';
import { ROUTES, TIMEOUTS } from '../config/constants.js';
import { Logger } from '../utils/logger.js';
import { BasePage } from './base.page.js';

export class CheckoutPage extends BasePage {
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly zipInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly finishButton: Locator;
  readonly summaryContainer: Locator;
  readonly summaryItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.zipInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
    this.finishButton = page.getByTestId('finish');
    this.summaryContainer = page.getByTestId('checkout-summary-container');
    this.summaryItems = this.summaryContainer.getByTestId('inventory-item');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async openStepOne(): Promise<this> {
    await this.goto(ROUTES.checkoutStepOne);
    await this.firstNameInput.waitFor({ state: 'visible', timeout: TIMEOUTS.default });
    return this;
  }

  /** Step 1: submit shipping info and land on the overview page. */
  async fillShippingInfo(info: CheckoutInfo): Promise<void> {
    await Logger.step('CheckoutPage', 'fill shipping information', async () => {
      await this.firstNameInput.fill(info.firstName);
      await this.lastNameInput.fill(info.lastName);
      await this.zipInput.fill(info.zipCode);
      await this.continueButton.click();
      await this.summaryContainer.waitFor({ state: 'visible', timeout: TIMEOUTS.default });
    });
  }

  /** Submit shipping info expecting validation failure (stays on step one). */
  async submitInvalidInfo(info: Partial<CheckoutInfo>): Promise<void> {
    await this.firstNameInput.fill(info.firstName ?? '');
    await this.lastNameInput.fill(info.lastName ?? '');
    await this.zipInput.fill(info.zipCode ?? '');
    await this.continueButton.click();
    await this.errorMessage.waitFor({ state: 'visible', timeout: TIMEOUTS.short });
  }

  async getErrorText(): Promise<string> {
    return this.textOf(this.errorMessage);
  }

  /** Step 2 helpers: parsed totals from the overview. */
  async getSubtotal(): Promise<number> {
    const text = await this.textOf(this.subtotalLabel);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTax(): Promise<number> {
    const text = await this.textOf(this.taxLabel);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTotal(): Promise<number> {
    const text = await this.textOf(this.totalLabel);
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getSummaryItemNames(): Promise<string[]> {
    return this.summaryItems
      .getByTestId('inventory-item-name')
      .allTextContents() as Promise<string[]>;
  }

  /** Step 3: confirm the order and land on the completion page. */
  async finish(): Promise<void> {
    await Logger.step('CheckoutPage', 'finish checkout', async () => {
      await this.finishButton.click();
      await this.completeHeader.waitFor({ state: 'visible', timeout: TIMEOUTS.default });
    });
  }

  async getConfirmationText(): Promise<string> {
    return this.textOf(this.completeHeader);
  }

  async backToInventory(): Promise<void> {
    await this.backHomeButton.click();
    await this.page.waitForURL(`**${ROUTES.inventory}`, { timeout: TIMEOUTS.default });
  }
}
