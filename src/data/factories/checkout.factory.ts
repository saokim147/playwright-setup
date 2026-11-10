import { faker } from '@faker-js/faker';
import type { CheckoutInfo } from '../../types/index.js';

/**
 * Faker-powered data factory for checkout shipping information.
 * Generates realistic but disposable identities per test run.
 */
export function createCheckoutInfo(overrides: Partial<CheckoutInfo> = {}): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode(),
    ...overrides,
  };
}

/** Invalid variants for checkout step-one validation tests. */
export function invalidCheckoutInfos(): { label: string; info: Partial<CheckoutInfo>; error: string }[] {
  const base = createCheckoutInfo();
  return [
    {
      label: 'missing first name',
      info: { ...base, firstName: '' },
      error: 'Error: First Name is required',
    },
    {
      label: 'missing last name',
      info: { ...base, lastName: '' },
      error: 'Error: Last Name is required',
    },
    {
      label: 'missing zip code',
      info: { ...base, zipCode: '' },
      error: 'Error: Postal Code is required',
    },
  ];
}
