import type { EnvironmentConfig, EnvironmentName, User, UserRole } from '../types/index.js';

/**
 * Multi-environment configuration.
 *
 * The active environment is resolved from (in order):
 *   1. TEST_ENV / ENV process variable
 *   2. 'staging' as a safe default
 */
export const environments: Record<EnvironmentName, EnvironmentConfig> = {
  staging: {
    name: 'staging',
    baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    defaultUserRole: 'standard',
  },
  production: {
    name: 'production',
    baseUrl: process.env.PROD_BASE_URL ?? 'https://www.saucedemo.com',
    defaultUserRole: 'standard',
  },
};

export function getEnvironment(name?: string): EnvironmentConfig {
  const requested = (name ?? process.env.TEST_ENV ?? process.env.ENV ?? 'staging').toLowerCase();
  const env = environments[requested as EnvironmentName];
  if (!env) {
    throw new Error(
      `Unknown environment '${requested}'. Valid options: ${Object.keys(environments).join(', ')}`,
    );
  }
  return env;
}

/** Shared password for all demo roles; overridable via SAUCE_PASSWORD. */
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

const usernames: Record<UserRole, string> = {
  standard: process.env.SAUCE_STANDARD_USER ?? 'standard_user',
  lockedOut: process.env.SAUCE_LOCKED_OUT_USER ?? 'locked_out_user',
  problem: process.env.SAUCE_PROBLEM_USER ?? 'problem_user',
  performanceGlitch: process.env.SAUCE_PERFORMANCE_USER ?? 'performance_glitch_user',
  error: process.env.SAUCE_ERROR_USER ?? 'error_user',
  visual: process.env.SAUCE_VISUAL_USER ?? 'visual_user',
};

/** Resolve credentials for a role, honoring environment overrides. */
export function getUser(role: UserRole = getEnvironment().defaultUserRole): User {
  return { role, username: usernames[role], password };
}

export const baseUrl = getEnvironment().baseUrl;
