import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Formats a numeric currency amount according to regional locale conventions (e.g., Indian Lakhs/Crores for INR).
 *
 * @param amount - The numeric monetary value to be formatted.
 * @param currency - The 3-letter currency code (defaults to 'INR').
 * @param compact - When true, abbreviates large numbers into human-friendly notation (e.g., ₹1.5L, ₹1.2Cr, $1.5M).
 * @returns Formatted currency string with appropriate symbol and punctuation (e.g. "₹45,000", "₹1.5L").
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  compact: boolean = false
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }

  if (compact) {
    if (currency === 'INR') {
      if (Math.abs(amount) >= 10000000) {
        return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `${symbol}${(amount / 100000).toFixed(1)}L`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(0)}k`;
      }
    } else {
      if (Math.abs(amount) >= 1000000) {
        return `${symbol}${(amount / 1000000).toFixed(1)}M`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(0)}k`;
      }
    }
    return `${symbol}${amount.toLocaleString()}`;
  }

  // Full format
  if (currency === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-US')}`;
}

/**
 * Formats an ISO date string or calendar timestamp into an accessible, readable date representation.
 *
 * @param dateString - ISO 8601 date string (e.g., "2026-11-28") or Date parseable string.
 * @returns Formatted date representation (e.g., "Sat, Nov 28, 2026") or fallback string if invalid.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Date TBD';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Calculates remaining days until target event date and returns human-readable status metadata.
 *
 * @param targetDate - ISO date string indicating the planned celebration or milestone day.
 * @returns Metadata object containing days count, readable display label, past flag, and today flag.
 */
export function getDaysRemaining(targetDate: string): {
  days: number;
  label: string;
  isPast: boolean;
  isToday: boolean;
} {
  if (!targetDate) {
    return { days: 0, label: 'No date set', isPast: false, isToday: false };
  }

  const target = new Date(targetDate);
  const now = new Date();

  // Set both to midnight for exact calendar day comparison
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, label: 'Today is event day!', isPast: false, isToday: true };
  } else if (diffDays === 1) {
    return { days: 1, label: 'Tomorrow', isPast: false, isToday: false };
  } else if (diffDays > 1) {
    return { days: diffDays, label: `${diffDays} days to go`, isPast: false, isToday: false };
  } else if (diffDays === -1) {
    return { days: diffDays, label: 'Yesterday', isPast: true, isToday: false };
  } else {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days ago`, isPast: true, isToday: false };
  }
}

/**
 * Normalizes time string for display.
 *
 * @param timeStr - Time string representation (e.g. "06:00 PM").
 * @returns Formatted time string or empty string if input is falsy.
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr;
}

/**
 * Computes safe clamped integer percentage between 0 and 100.
 *
 * @param value - Numerator (current accumulated count or spent amount).
 * @param total - Denominator (target headcount or total budget allocation).
 * @returns Clamped integer percentage between 0 and 100.
 */
export function formatPercent(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Math.round((value / total) * 100);
  return Math.min(Math.max(pct, 0), 100);
}
