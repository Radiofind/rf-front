import { describe, expect, it } from 'vitest';
import { transformDateToString, transformStringToDate } from './date.helpers';

describe('date.helpers', () => {
  describe('transformStringToDate', () => {
    it('parses an ISO-like date string into a local Date', () => {
      const result: Date = transformStringToDate('1994-03-07');

      expect(result.getFullYear()).toBe(1994);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(7);
    });
  });

  describe('transformDateToString', () => {
    it('pads month and day to two digits', () => {
      expect(transformDateToString(new Date(2001, 0, 5))).toBe('2001-01-05');
    });
  });
});
