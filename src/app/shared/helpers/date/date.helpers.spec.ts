import { describe, expect, it } from 'vitest';
import {
  formatStringDate,
  toRelativeTime,
  transformDateToString,
  transformStringToDate,
} from './date.helpers';
import { DateFormatEnum } from '../../../core/enums/date-format.enum';

import type { IRelativeTime } from '../../models/relative-time.model';

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
      expect(
        formatStringDate('2026-10-08T14:49:13.480378', DateFormatEnum.MONTH_YEAR, 'en-US'),
      ).toBe('Oct 2026');
    });

    it('formats a plain date string as full date', () => {
      expect(formatStringDate('1998-06-07', DateFormatEnum.FULL_DATE, 'en-US')).toBe('Jun 7, 1998');
    });

    it('formats the date in the given locale', () => {
      expect(formatStringDate('1998-06-07', DateFormatEnum.FULL_DATE, 'de-DE')).toBe(
        '7. Juni 1998',
      );
      expect(formatStringDate('2026-10-08', DateFormatEnum.MONTH_YEAR, 'ru-RU')).toContain('2026');
    });

    it('ignores the time part so dates near midnight keep their day', () => {
      expect(
        formatStringDate('2025-12-31T23:59:59.999999', DateFormatEnum.FULL_DATE, 'en-US'),
      ).toBe('Dec 31, 2025');
      expect(
        formatStringDate('2025-01-01T00:00:00.000000', DateFormatEnum.MONTH_YEAR, 'en-US'),
      ).toBe('Jan 2025');
    });
  });

  describe('toRelativeTime', () => {
    const now: Date = new Date('2026-11-05T12:00:00Z');

    it.each<[string, IRelativeTime]>([
      ['2026-11-05T11:59:30Z', { value: -30, unit: 'second' }],
      ['2026-11-05T11:15:00Z', { value: -45, unit: 'minute' }],
      ['2026-11-05T09:00:00Z', { value: -3, unit: 'hour' }],
      ['2026-11-03T06:00:00Z', { value: -2, unit: 'day' }],
      ['2026-10-22T12:00:00Z', { value: -2, unit: 'week' }],
      ['2026-08-01T12:00:00Z', { value: -3, unit: 'month' }],
      ['2024-11-01T12:00:00Z', { value: -2, unit: 'year' }],
    ])('describes %s in the largest whole unit', (date, expected) => {
      expect(toRelativeTime(date, now)).toEqual(expected);
    });

    it('reads backend instants with microseconds', () => {
      expect(toRelativeTime('2026-11-05T10:59:59.123456Z', now)).toEqual({
        value: -1,
        unit: 'hour',
      });
    });

    it('treats a date slightly in the future as now', () => {
      expect(toRelativeTime('2026-11-05T12:00:05Z', now)).toEqual({ value: 0, unit: 'second' });
    });
  });
});
