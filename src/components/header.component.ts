import type { Locator, Page } from '@playwright/test';
import { TIMEOUTS } from '../config/constants.js';
import { Logger } from '../utils/logger.js';

/**
 * Reusable header component present on every authenticated page:
 * burger menu, cart badge, and cart navigation.
 */
export class HeaderComponent {

  readonly menuButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly logoutLink: Locator;
  readonly resetStateLink: Locator;
  readonly aboutLink: Locator;

  constructor(private readonly page: Page) {
    // the data-test=open-menu img sits inside the actual clickable button
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetStateLink = page.getByTestId('reset-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
  }

  /** Number shown on the cart badge; 0 when the badge is absent. */
  async getCartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return parseInt((await this.cartBadge.textContent())?.trim() ?? '0', 10);
  }

  async openCart(): Promise<void> {
    await Logger.step('HeaderComponent', 'open cart from header', async () => {
      await this.cartLink.click();
    });
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible', timeout: TIMEOUTS.short });
  }

  async closeMenu(): Promise<void> {
    await this.page.locator('.bm-cross-button').click();
    await this.logoutLink.waitFor({ state: 'hidden', timeout: TIMEOUTS.short });
  }

  async logout(): Promise<void> {
    await Logger.step('HeaderComponent', 'logout via header menu', async () => {
      await this.openMenu();
      await this.logoutLink.click();
      await this.page.waitForURL(/.*\/(index.html)?$/, { timeout: TIMEOUTS.default });
    });
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetStateLink.click();
    await this.closeMenu();
  }
}
