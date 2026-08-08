import { Language, Product } from '../types';

/**
 * Formats USD price to Rupiah (Rp) if Indonesian language is active (rate 1 USD = Rp 15,000),
 * or USD ($) if English is active.
 */
export function formatPrice(price: number, language?: Language): string {
  const num = Number(price) || 0;
  return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
}

/**
 * Returns product name localized according to language choice.
 */
export function getProductName(product: Product, language: Language): string {
  if (language === 'ID' && product.nameId) {
    return product.nameId;
  }
  return product.name;
}

/**
 * Returns product description localized according to language choice.
 */
export function getProductDescription(product: Product, language: Language): string {
  if (language === 'ID' && product.descriptionId) {
    return product.descriptionId;
  }
  return product.description;
}
