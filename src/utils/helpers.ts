import type { Page } from '@playwright/test';
import type { LoadMetrics, WebVitals } from '../types/index.js';
import { Logger } from './logger.js';


interface VitalsBuffer {
  lcpMs: number | null;
  cls: number;
  fcpMs: number | null;
}

/** layout-shift entry shape — not part of TS's baseline DOM lib. */
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

declare global {
  interface Window {
    __vitals?: VitalsBuffer;
  }
}

/**
 * Collect navigation + resource metrics for the page currently loaded.
 * Must be called after `page.goto()` has resolved.
 */
export async function measurePageLoad(page: Page): Promise<LoadMetrics> {
  const raw = await page.evaluate(() => {

    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const resources = performance
      .getEntriesByType('resource')
      .map((entry) => entry as PerformanceResourceTiming);

    return {
      ttfbMs: nav ? Math.max(0, nav.responseStart - nav.startTime) : -1,
      domContentLoadedMs: nav ? Math.max(0, nav.domContentLoadedEventEnd) : -1,
      loadEventMs: nav ? Math.max(0, nav.loadEventEnd) : -1,
      transferredBytes: resources.reduce((sum, r) => sum + r.transferSize, 0),
      requestCount: resources.length,
    };
  });

  const metrics: LoadMetrics = {
    url: page.url(),
    ttfbMs: raw.ttfbMs,
    domContentLoadedMs: raw.domContentLoadedMs,
    loadEventMs: raw.loadEventMs,
    transferredKB: Math.round(raw.transferredBytes / 1024),
    requestCount: raw.requestCount,
  };

  Logger.debug(
    'Helpers',
    `load metrics for ${metrics.url}: ttfb=${metrics.ttfbMs}ms dcl=${metrics.domContentLoadedMs}ms ` +
    `load=${metrics.loadEventMs}ms transferred=${metrics.transferredKB}KB requests=${metrics.requestCount}`,
  );
  return metrics;
}

/**
 * Navigate to a URL with buffered web-vital observers injected up front,
 * then collect LCP / CLS / FCP after load settles.
 */
export async function measureWebVitals(page: Page, url: string, settleMs = 1_500): Promise<WebVitals> {
  await page.addInitScript(() => {
    const buffered: VitalsBuffer = { lcpMs: null, cls: 0, fcpMs: null };
    window.__vitals = buffered;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries.at(-1);
      if (last) buffered.lcpMs = last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // layout-shift entries expose hadRecentInput/value beyond base PerformanceEntry
        const shift = entry as LayoutShiftEntry;
        if (!shift.hadRecentInput) buffered.cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver((list) => {
      const first = list.getEntries()[0];
      if (first && first.name === 'first-contentful-paint') buffered.fcpMs = first.startTime;
    }).observe({ type: 'paint', buffered: true });
  });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(settleMs);

  const buffered = (await page.evaluate(() => window.__vitals)) ?? {
    lcpMs: null,
    cls: 0,
    fcpMs: null,
  };

  const vitals: WebVitals = {
    lcpMs: buffered.lcpMs === null ? null : Math.round(buffered.lcpMs),
    cls: Math.round(buffered.cls * 1000) / 1000,
    fcpMs: buffered.fcpMs === null ? null : Math.round(buffered.fcpMs),
  };
  Logger.debug('Helpers', `web vitals for ${url}: ${JSON.stringify(vitals)}`);
  return vitals;
}

/** Wait until no network requests have been issued for `idleMs`. */
export async function waitForNetworkIdle(page: Page, idleMs = 500, timeoutMs = 15_000): Promise<void> {
  const start = Date.now();
  let lastActivity = Date.now();

  page.on('request', () => (lastActivity = Date.now()));
  page.on('response', () => (lastActivity = Date.now()));

  while (Date.now() - start < timeoutMs) {
    if (Date.now() - lastActivity >= idleMs) return;
    await page.waitForTimeout(100);
  }
  throw new Error(`Network did not go idle within ${timeoutMs}ms`);
}

/** Block requests matching any of the given URL substrings (e.g. ads, analytics). */
export async function blockRequests(page: Page, patterns: string[]): Promise<void> {
  await page.route('**/*', (route) =>
    patterns.some((p) => route.request().url().includes(p)) ? route.abort() : route.continue(),
  );
  Logger.debug('Helpers', `blocking request patterns: ${patterns.join(', ')}`);
}
