import { Product, Courier } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const COURIER_OPTIONS: Courier[] = [
  {
    id: 'jne',
    name: 'JNE Express - Regular Courier',
    estimatedDays: '2-3 Business Days',
    price: 10000
  },
  {
    id: 'hyperspace',
    name: 'HyperSpace Instant Courier',
    estimatedDays: 'Same Day / 1 Day',
    price: 25000
  },
  {
    id: 'pos',
    name: 'POS Indonesia Mail - Snail Mail',
    estimatedDays: '4-6 Business Days',
    price: 5000
  }
];
