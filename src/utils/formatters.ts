import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

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

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr;
}

export function formatPercent(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Math.round((value / total) * 100);
  return Math.min(Math.max(pct, 0), 100);
}
