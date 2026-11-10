import { describe, expect, it } from 'vitest';
import { totalPages, visiblePages } from './pagination.helpers';

describe('pagination helpers', () => {
  it.each([
    [0, 10, 0],
    [7, 10, 1],
    [10, 10, 1],
    [11, 10, 2],
  ])(
    'splits %s items into pages of %s as %s pages',
    (items: number, size: number, pages: number) => {
      expect(totalPages(items, size)).toBe(pages);
    },
  );

  it.each([
    [0, 1, [0]],
    [0, 3, [0, 1, 2]],
    [0, 9, [0, 1, 2, 3, 4]],
    [4, 9, [2, 3, 4, 5, 6]],
    [8, 9, [4, 5, 6, 7, 8]],
    [0, 0, []],
  ])(
    'shows the pages around page %s of %s as %j',
    (current: number, total: number, expected: number[]) => {
      expect(visiblePages(current, total, 5)).toEqual(expected);
    },
  );
});
