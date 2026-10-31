import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

describe('Formatting Utilities Suite', () => {
  describe('formatCurrency', () => {
    it('formats Indian Rupees with standard Indian comma grouping', () => {
      expect(formatCurrency(45000, 'INR')).toBe('₹45,000');
      expect(formatCurrency(150000, 'INR')).toBe('₹1,50,000');
      expect(formatCurrency(12500000, 'INR')).toBe('₹1,25,00,000');
    });

    it('formats Indian Rupees in compact notation with compact flag', () => {
      expect(formatCurrency(150000, 'INR', true)).toBe('₹1.5L');
      expect(formatCurrency(1000000, 'INR', true)).toBe('₹10.0L');
      expect(formatCurrency(12500000, 'INR', true)).toBe('₹1.3Cr');
      expect(formatCurrency(50000, 'INR', true)).toBe('₹50k');
    });

    it('formats foreign currencies (USD, EUR, GBP) with standard international rules', () => {
      const formattedUsd = formatCurrency(5000, 'USD');
      expect(formattedUsd).toContain('5,000');
      expect(formattedUsd).toContain('$');

      const formattedEur = formatCurrency(12000, 'EUR');
      expect(formattedEur).toContain('12,000');
      expect(formattedEur).toContain('€');

      const formattedGbp = formatCurrency(8500, 'GBP');
      expect(formattedGbp).toContain('8,500');
      expect(formattedGbp).toContain('£');
    });

    it('formats foreign currencies in compact notation', () => {
      expect(formatCurrency(1500000, 'USD', true)).toBe('$1.5M');
      expect(formatCurrency(25000, 'USD', true)).toBe('$25k');
    });

    it('handles zero, negative numbers, and null/undefined values without crashing', () => {
      expect(formatCurrency(0, 'INR')).toBe('₹0');
      expect(formatCurrency(-5000, 'INR')).toContain('5,000');
      expect(formatCurrency(undefined as unknown as number, 'INR')).toBe('₹0');
      expect(formatCurrency(null as unknown as number, 'INR')).toBe('₹0');
      expect(formatCurrency(NaN, 'INR')).toBe('₹0');
    });
  });

  describe('formatPercent', () => {
    it('calculates standard integer percentage', () => {
      expect(formatPercent(25, 100)).toBe(25);
      expect(formatPercent(500, 1000)).toBe(50);
      expect(formatPercent(100, 100)).toBe(100);
    });

    it('handles zero denominator and edge values without producing NaN', () => {
      expect(formatPercent(50, 0)).toBe(0);
      expect(formatPercent(0, 100)).toBe(0);
      expect(formatPercent(0, 0)).toBe(0);
    });

    it('rounds floating percentages deterministically', () => {
      expect(formatPercent(1, 3)).toBe(33);
      expect(formatPercent(2, 3)).toBe(67);
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings into readable human dates', () => {
      const formatted = formatDate('2026-12-25');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Dec');
    });

    it('handles empty or missing date strings gracefully', () => {
      expect(formatDate('')).toBe('Date TBD');
    });
  });
});
