import type { SortOption } from '../types/index.js';

/** Application routes (relative to the environment base URL). */
export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkoutStepOne: '/checkout-step-one.html',
  checkoutStepTwo: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;

/** Timeout budgets in milliseconds. */
export const TIMEOUTS = {
  default: 10_000,
  short: 3_000,
  slow: 45_000, // performance_glitch_user intentionally delays the app
} as const;

/** Performance thresholds enforced by tests/performance. */
export const THRESHOLDS = {
  ttfbMs: 1_500,
  domContentLoadedMs: 3_000,
  loadEventMs: 5_000,
  transferredKB: 3_000,
  requestCount: 80,
  lcpMs: 4_000,
  cls: 0.25,
} as const;

/** Select values used by the inventory sort dropdown. */
export const SORT_VALUES: Record<SortOption, string> = {
  'name-asc': 'az',
  'name-desc': 'za',
  'price-asc': 'lohi',
  'price-desc': 'hilo',
};

/** Where the authenticated session is persisted by tests/setup/auth.setup.ts. */
export const STORAGE_STATE_PATH = '.auth/user.json';

/** Product count shown on the inventory page. */
export const INVENTORY_PRODUCT_COUNT = 6;

/** Tax rate applied on the checkout overview page. */
export const TAX_RATE = 0.08;
