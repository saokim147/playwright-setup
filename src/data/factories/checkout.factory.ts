import { faker } from '@faker-js/faker';
import type { CheckoutInfo } from '../../types/index.js';

export function createCheckoutInfo(overrides: Partial<CheckoutInfo> = {}): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode(),
    ...overrides,
  };
}

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
