/**
 * Shared TypeScript interfaces & types used across the framework.
 */

/** Roles supported by the application under test. */
export type UserRole =
  | 'standard'
  | 'lockedOut'
  | 'problem'
  | 'performanceGlitch'
  | 'error'
  | 'visual';

/** Application credentials for a given role. */
export interface User {
  role: UserRole;
  username: string;
  password: string;
}

/** Catalog product definition. */
export interface Product {
  id: string;
  name: string;
  price: number;
}

/** Line item as displayed in the cart / checkout overview. */
export interface CartItem {
  name: string;
  price: number;
}

/** Shipping information collected during checkout step one. */
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  zipCode: string;
}

/** Sort options exposed by the inventory page. */
export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

/** Environment names recognized by the framework. */
export type EnvironmentName = 'staging' | 'production';

/** Per-environment configuration. */
export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;
  /** Default role used by authenticated fixtures and the auth setup project. */
  defaultUserRole: UserRole;
}

/** Navigation timing snapshot used by performance specs. */
export interface LoadMetrics {
  url: string;
  ttfbMs: number;
  domContentLoadedMs: number;
  loadEventMs: number;
  transferredKB: number;
  requestCount: number;
}

/** Core Web Vitals collected in the browser. */
export interface WebVitals {
  lcpMs: number | null;
  cls: number | null;
  fcpMs: number | null;
}
