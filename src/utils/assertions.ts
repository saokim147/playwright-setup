import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { Logger } from './logger.js';


export function expectVisible(locator: Locator, description: string, timeout = 10_000) {
  Logger.debug('Assertions', `expect visible: ${description}`);
  return expect(locator, `${description} should be visible`).toBeVisible({ timeout });
}

export function expectHidden(locator: Locator, description: string, timeout = 10_000) {
  Logger.debug('Assertions', `expect hidden: ${description}`);
  return expect(locator, `${description} should be hidden`).toBeHidden({ timeout });
}

export function expectText(locator: Locator, expected: string, description: string, timeout = 10_000) {
  Logger.debug('Assertions', `expect text '${expected}': ${description}`);
  return expect(locator, `${description} should show '${expected}'`).toHaveText(expected, { timeout });
}

export function expectTextContains(
  locator: Locator,
  substring: string,
  description: string,
  timeout = 10_000,
) {
  Logger.debug('Assertions', `expect text contains '${substring}': ${description}`);
  return expect(locator, `${description} should contain '${substring}'`).toContainText(substring, {
    timeout,
  });
}

export function expectCount(locator: Locator, expected: number, description: string, timeout = 10_000) {
  Logger.debug('Assertions', `expect count ${expected}: ${description}`);
  return expect(locator, `${description} should have ${expected} item(s)`).toHaveCount(expected, {
    timeout,
  });
}

export function expectUrlContains(page: Page, fragment: string, description = 'page url') {
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  Logger.debug('Assertions', `expect url contains '${fragment}'`);
  return expect(page, `${description} should contain '${fragment}'`).toHaveURL(new RegExp(escaped));
}
