import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { getUser } from '../config/environments.js';
import { LoginPage } from '../pages/login.page.js';
import { InventoryPage } from '../pages/inventory.page.js';
import { CartPage } from '../pages/cart.page.js';
import { CheckoutPage } from '../pages/checkout.page.js';
import { HeaderComponent } from '../components/header.component.js';

/**
 * Custom fixtures: every page object and component, pre-bound to the test's
 * page instance. Tests never construct page objects manually.
 */
type FrameworkFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: HeaderComponent;
};
export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
});


export const testWithLogin = base.extend<FrameworkFixtures & { authenticatedPage: Page }>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  authenticatedPage: async ({ loginPage }, use) => {
    await loginPage.open();
    await loginPage.login(getUser());
    await use(loginPage.page);
  },
});

export { expect } from '@playwright/test';
