import type { SortOption } from '../types/index.js';

export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkoutStepOne: '/checkout-step-one.html',
  checkoutStepTwo: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;

export const TIMEOUTS = {
  default: 10_000,
  short: 3_000,
  slow: 45_000,
} as const;

export const THRESHOLDS = {
  ttfbMs: 1_500,
  domContentLoadedMs: 3_000,
  loadEventMs: 5_000,
  transferredKB: 3_000,
  requestCount: 80,
  lcpMs: 4_000,
  cls: 0.25,
} as const;

export const SORT_VALUES: Record<SortOption, string> = {
  'name-asc': 'az',
  'name-desc': 'za',
  'price-asc': 'lohi',
  'price-desc': 'hilo',
};

export const STORAGE_STATE_PATH = '.auth/user.json';

export const INVENTORY_PRODUCT_COUNT = 6;

export const TAX_RATE = 0.08;
