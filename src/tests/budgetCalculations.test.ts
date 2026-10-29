import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent } from '../utils/formatters';

describe('Budget Calculations & Formatting', () => {
  it('formats INR with Indian numbering system (Lakhs & Crores)', () => {
    expect(formatCurrency(45000, 'INR')).toBe('₹45,000');
    expect(formatCurrency(1500000, 'INR')).toBe('₹15,00,000');
    expect(formatCurrency(1500000, 'INR', true)).toBe('₹15.0L');
    expect(formatCurrency(25000000, 'INR', true)).toBe('₹2.5Cr');
  });

  it('formats international currencies (USD, EUR, GBP)', () => {
    expect(formatCurrency(5000, 'USD')).toBe('$5,000');
    expect(formatCurrency(5000, 'USD', true)).toBe('$5k');
    expect(formatCurrency(12000, 'EUR')).toBe('€12,000');
    expect(formatCurrency(8500, 'GBP')).toBe('£8,500');
  });

  it('accurately computes over-allocation and remaining variance', () => {
    const totalBudget = 50000;
    const categories = [
      { key: 'Venue', allocatedAmount: 20000 },
      { key: 'Catering', allocatedAmount: 25000 },
      { key: 'Decor', allocatedAmount: 10000 }, // sum = 55,000 (over budget by 5,000)
    ];

    const sumAllocated = categories.reduce((s, c) => s + c.allocatedAmount, 0);
    const isOverAllocated = sumAllocated > totalBudget;
    const variance = totalBudget - sumAllocated;

    expect(sumAllocated).toBe(55000);
    expect(isOverAllocated).toBe(true);
    expect(variance).toBe(-5000);
  });

  it('computes paid actuals and remaining balance', () => {
    const totalBudget = 50000;
    const expenses = [
      { id: '1', estimatedAmount: 10000, actualAmount: 10000, isPaid: true },
      { id: '2', estimatedAmount: 15000, actualAmount: 14000, isPaid: true },
      { id: '3', estimatedAmount: 8000, actualAmount: 8000, isPaid: false },
    ];

    const actualPaid = expenses.reduce((s, e) => s + (e.isPaid ? e.actualAmount : 0), 0);
    const remainingCash = totalBudget - actualPaid;

    expect(actualPaid).toBe(24000);
    expect(remainingCash).toBe(26000);
    expect(formatPercent(actualPaid, totalBudget)).toBe(48);
  });
});

