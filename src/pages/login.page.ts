import type { Locator, Page } from '@playwright/test';
import type { User } from '../types/index.js';
import { ROUTES, TIMEOUTS } from '../config/constants.js';
import { Logger } from '../utils/logger.js';
import { BasePage } from './base.page.js';

/** Login page: credential entry, error surface, session bootstrap. */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
  }

  async open(): Promise<this> {
    await this.goto(ROUTES.login);
    await this.waitForVisible(this.usernameInput);
    return this;
  }

  /** Submit credentials and wait for redirect away from the login route. */
  async login(user: User): Promise<void> {
    await Logger.step('LoginPage', `login as ${user.role}`, async () => {
      await this.usernameInput.fill(user.username);
      await this.passwordInput.fill(user.password);
      await this.loginButton.click();
      // login failure keeps us on / (or /index.html); success redirects away
      await this.page.waitForURL(
        (url) => !['/', '/index.html'].includes(url.pathname),
        { timeout: TIMEOUTS.slow },
      );
    });
  }

  /** Submit credentials but expect to stay on the login page (failure path). */
  async loginExpectingFailure(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
    await this.waitForVisible(this.errorMessage);
  }

  async getErrorText(): Promise<string> {
    return this.textOf(this.errorMessage);
  }

  async closeError(): Promise<void> {
    await this.errorMessage.getByRole('button').click();
    await this.errorMessage.waitFor({ state: 'hidden' });
  }

  async expectLoginFormVisible(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible', timeout: TIMEOUTS.short });
  }
}
