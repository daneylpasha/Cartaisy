/**
 * Format a price amount with the correct currency symbol
 * Uses Intl.NumberFormat for proper locale-aware formatting
 *
 * @param amount - The numeric price amount
 * @param currencyCode - ISO 4217 currency code (USD, GBP, EUR, etc.)
 * @param locale - Optional locale for formatting (defaults to en-US)
 * @returns Formatted price string (e.g., "$84.99", "£65.00", "€79.99")
 */
export const formatPrice = (
  amount: number | string | undefined | null,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string => {
  // Handle undefined/null/NaN
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);

  if (isNaN(numAmount)) {
    return formatPrice(0, currencyCode, locale);
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(numAmount);
  } catch (error) {
    // Fallback if currency code is invalid
    console.warn(`[formatPrice] Invalid currency code: ${currencyCode}, falling back to USD`);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  }
};

/**
 * Format a price range (e.g., for products with variants)
 */
export const formatPriceRange = (
  minPrice: number,
  maxPrice: number,
  currencyCode: string = 'USD'
): string => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currencyCode);
  }
  return `${formatPrice(minPrice, currencyCode)} - ${formatPrice(maxPrice, currencyCode)}`;
};
