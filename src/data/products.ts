import type { Product } from '../types/index.js';

export const products: Product[] = [
  { id: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: 29.99 },
  { id: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: 9.99 },
  { id: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { id: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { id: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: 7.99 },
  { id: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

export const productByName = (name: string): Product | undefined =>
  products.find((p) => p.name === name);

export const totalPrice = (): number =>
  Math.round(products.reduce((sum, p) => sum + p.price, 0) * 100) / 100;

export const productIdFromName = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-');

export const sortedNames = {
  'name-asc': [...products].sort((a, b) => a.name.localeCompare(b.name)).map((p) => p.name),
  'name-desc': [...products].sort((a, b) => b.name.localeCompare(a.name)).map((p) => p.name),
  'price-asc': [...products].sort((a, b) => a.price - b.price).map((p) => p.name),
  'price-desc': [...products].sort((a, b) => b.price - a.price).map((p) => p.name),
};

export const ascendingPrices: number[] = [...products]
  .sort((a, b) => a.price - b.price)
  .map((p) => p.price);
