
/**
 * Format a number as Indonesian Rupiah (IDR)
 * @param amount - The amount to format
 * @returns Formatted string with IDR symbol (e.g., Rp 50.000)
 */
export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    // Replace the non-breaking space that might be added in some browsers
    .replace(/\s/g, ' ');
};

/**
 * Parse an IDR string back to a number
 * @param idrString - The IDR string to parse (e.g., "Rp 50.000")
 * @returns The numeric value
 */
export const parseIDR = (idrString: string): number => {
  // Remove currency symbol, spaces, and replace decimal separators
  const sanitized = idrString
    .replace(/[^\d,]/g, '')  // Remove everything except digits and commas
    .replace(/,/g, '.');     // Replace commas with dots for JS parsing
  
  return parseFloat(sanitized);
};
