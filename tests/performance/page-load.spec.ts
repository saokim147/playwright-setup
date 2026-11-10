import { test, expect } from '../../src/fixtures/index.js';
import { measurePageLoad, measureWebVitals } from '../../src/utils/helpers.js';
import { baseUrl } from '../../src/config/environments.js';
import { ROUTES, THRESHOLDS } from '../../src/config/constants.js';

/**
 * Performance: Core Web Vitals + load thresholds against the environment
 * base URL. Thresholds live in src/config/constants.ts (THRESHOLDS).
 */
test.describe('Page load performance @performance', () => {
  test('login page loads within budget @smoke', async ({ page }) => {
    await page.goto(ROUTES.login, { waitUntil: 'load' });

    const metrics = await measurePageLoad(page);

    expect(metrics.ttfbMs, 'TTFB within budget').toBeLessThan(THRESHOLDS.ttfbMs);
    expect(metrics.domContentLoadedMs, 'DOM content loaded within budget').toBeLessThan(
      THRESHOLDS.domContentLoadedMs,
    );
    expect(metrics.loadEventMs, 'load event within budget').toBeLessThan(THRESHOLDS.loadEventMs);
    expect(metrics.transferredKB, 'payload within budget').toBeLessThan(THRESHOLDS.transferredKB);
    expect(metrics.requestCount, 'request count within budget').toBeLessThan(
      THRESHOLDS.requestCount,
    );
  });

  test('inventory page loads within budget', async ({ page }) => {
    await page.goto(ROUTES.inventory, { waitUntil: 'load' });

    const metrics = await measurePageLoad(page);

    expect(metrics.loadEventMs, 'load event within budget').toBeLessThan(THRESHOLDS.loadEventMs);
    expect(metrics.transferredKB, 'payload within budget').toBeLessThan(THRESHOLDS.transferredKB);
  });

  test('login page Core Web Vitals within thresholds', async ({ page }) => {
    const vitals = await measureWebVitals(page, `${baseUrl}${ROUTES.login}`);

    test.info().annotations.push(
      { type: 'LCP', description: `${vitals.lcpMs ?? 'n/a'}ms` },
      { type: 'CLS', description: `${vitals.cls ?? 'n/a'}` },
      { type: 'FCP', description: `${vitals.fcpMs ?? 'n/a'}ms` },
    );

    if (vitals.lcpMs !== null) {
      expect(vitals.lcpMs, 'LCP within threshold').toBeLessThan(THRESHOLDS.lcpMs);
    }
    if (vitals.cls !== null) {
      expect(vitals.cls, 'CLS within threshold').toBeLessThan(THRESHOLDS.cls);
    }
  });
});
