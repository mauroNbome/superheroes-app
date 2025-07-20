import { formatDate, isValidDate, isFutureDate, formatDateForInput, getCurrentDate } from './date.utils';

describe('DateUtils', () => {
  const testDate = new Date('2023-06-15');
  const invalidDate = 'invalid-date';
  const futureDate = new Date('2025-12-31');

  describe('formatDate', () => {
    it('should format date with default locale and options', () => {
      const result = formatDate(testDate);
      expect(result).toBeTruthy();
      expect(result).toContain('2023');
    });

    it('should format date with custom locale', () => {
      const result = formatDate(testDate, 'en-US');
      expect(result).toBeTruthy();
      expect(result).toContain('2023');
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDate(invalidDate);
      expect(result).toBe('');
    });

    it('should handle null/undefined dates', () => {
      expect(formatDate(null as any)).toBe('');
      expect(formatDate(undefined as any)).toBe('');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date for HTML input (YYYY-MM-DD)', () => {
      const result = formatDateForInput(testDate);
      expect(result).toBe('2023-06-15');
    });

    it('should format date string for HTML input', () => {
      const result = formatDateForInput('2023-06-15');
      expect(result).toBe('2023-06-15');
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDateForInput(invalidDate);
      expect(result).toBe('');
    });

    it('should handle null/undefined dates', () => {
      expect(formatDateForInput(null as any)).toBe('');
      expect(formatDateForInput(undefined as any)).toBe('');
    });

    it('should pad single digit months and days', () => {
      const singleDigitDate = new Date('2023-01-05');
      const result = formatDateForInput(singleDigitDate);
      expect(result).toBe('2023-01-05');
    });
  });

  describe('getCurrentDate', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const result = getCurrentDate();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(result).toMatch(dateRegex);
    });

    it('should return todays date', () => {
      const today = new Date();
      const expected = formatDateForInput(today);
      const result = getCurrentDate();
      expect(result).toBe(expected);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(testDate)).toBe(true);
      expect(isValidDate('2023-06-15')).toBe(true);
      expect(isValidDate(new Date().getTime())).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate(invalidDate)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isFutureDate(testDate)).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isFutureDate(invalidDate)).toBe(false);
    });

    it('should handle current date correctly', () => {
      const now = new Date();
      expect(isFutureDate(now)).toBe(false);
    });
  });
}); 