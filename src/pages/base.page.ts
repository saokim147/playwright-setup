import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { baseUrl } from '../config/environments.js';
import { TIMEOUTS } from '../config/constants.js';
import { Logger } from '../utils/logger.js';
/**
 * Abstract base page: owns navigation, common waits, and structured logging.
 * Every page object extends this and declares its own selectors.
 */
export abstract class BasePage {
  constructor(public readonly page: Page) {}

  protected url(path = ''): string {
    return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  }

  async goto(path: string, options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}) {
    const target = this.url(path);
    await Logger.step(this.constructor.name, `navigate to ${target}`, async () => {
      await this.page.goto(target, { waitUntil: options.waitUntil ?? 'load' });
    });
    return this;
  }

  protected async waitForLoadSettled(timeout:number=TIMEOUTS.default): Promise<void> {
    await this.page.waitForLoadState('networkidle',{
      timeout:timeout,
    } );
  }

  protected async waitForVisible(locator:Locator,timeout:number=TIMEOUTS.default):Promise<void>{
    await locator.waitFor({ state: 'visible', timeout: timeout});
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async expectOnRoute(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`), {
      timeout: TIMEOUTS.short,
    });
  }

  /** Text of the first element matching locator, trimmed. */
  async textOf(locator: Locator): Promise<string> {
    return (await locator.first().textContent())?.trim() ?? '';
  }
}
