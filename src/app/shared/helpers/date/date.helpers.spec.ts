import { describe, expect, it } from 'vitest';
import { formatStringDate, transformDateToString, transformStringToDate } from './date.helpers';
import { DateFormatEnum } from '../../../core/enums/date-format.enum';

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

  describe('formatStringDate', () => {
    it('formats a backend datetime string as short month and year', () => {
      expect(formatStringDate('2026-10-08T14:49:13.480378', DateFormatEnum.MONTH_YEAR)).toBe(
        'Oct 2026',
      );
    });

    it('formats a plain date string as full date', () => {
      expect(formatStringDate('1998-06-07', DateFormatEnum.FULL_DATE)).toBe('Jun 7, 1998');
    });

    it('ignores the time part so dates near midnight keep their day', () => {
      expect(formatStringDate('2025-12-31T23:59:59.999999', DateFormatEnum.FULL_DATE)).toBe(
        'Dec 31, 2025',
      );
      expect(formatStringDate('2025-01-01T00:00:00.000000', DateFormatEnum.MONTH_YEAR)).toBe(
        'Jan 2025',
      );
    });
  });
});
