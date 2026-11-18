export type UserRole =
  | 'standard'
  | 'lockedOut'
  | 'problem'
  | 'performanceGlitch'
  | 'error'
  | 'visual';

export interface User {
  role: UserRole;
  username: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  name: string;
  price: number;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  zipCode: string;
}

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export type EnvironmentName = 'staging' | 'production';

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;

  defaultUserRole: UserRole;
}

export interface LoadMetrics {
  url: string;
  ttfbMs: number;
  domContentLoadedMs: number;
  loadEventMs: number;
  transferredKB: number;
  requestCount: number;
}

export interface WebVitals {
  lcpMs: number | null;
  cls: number | null;
  fcpMs: number | null;
}
