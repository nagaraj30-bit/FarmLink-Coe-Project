/**
 * Formats numbers into Indian Rupee currency string with ₹ symbol and Indian comma grouping.
 * E.g., 100000 -> ₹1,00,000; 42500 -> ₹42,500; 3500 -> ₹3,500
 */
export function formatINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a raw number using Indian numbering grouping (e.g. 1,00,000)
 */
export function formatNumberIN(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Formats an ISO date string to a human-readable date.
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Returns human-readable stated selling deadline description
 */
export function getDeadlineLabel(days: number): string {
  if (days <= 0) return 'Sell today';
  if (days === 1) return 'Sell within 1 day';
  return `Sell within ${days} days`;
}
