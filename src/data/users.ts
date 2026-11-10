import { getUser } from '../config/environments.js';
import type { User, UserRole } from '../types/index.js';

/**
 * Test users resolved from environment configuration.
 * Passwords and usernames are overridable via SAUCE_* env vars (see k8s/secret.yml).
 */
export const users = {
  get standard(): User {
    return getUser('standard');
  },
  get lockedOut(): User {
    return getUser('lockedOut');
  },
  get problem(): User {
    return getUser('problem');
  },
  get performanceGlitch(): User {
    return getUser('performanceGlitch');
  },
  get error(): User {
    return getUser('error');
  },
  get visual(): User {
    return getUser('visual');
  },
};

export function userByRole(role: UserRole): User {
  return getUser(role);
}
