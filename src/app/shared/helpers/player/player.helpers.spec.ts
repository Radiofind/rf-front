import { describe, expect, it } from 'vitest';
import { formatPlaybackTime, sequentialOrder, shuffledOrder } from './player.helpers';

describe('player helpers', () => {
  it.each([
    [0, '0:00'],
    [9.9, '0:09'],
    [84, '1:24'],
    [272, '4:32'],
    [3725, '62:05'],
  ])('formats %s seconds as %s', (seconds: number, expected: string) => {
    expect(formatPlaybackTime(seconds)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -5])(
    'formats the unknown duration %s as zero',
    (seconds: number) => {
      expect(formatPlaybackTime(seconds)).toBe('0:00');
    },
  );

  it('lists the queue positions in their original order', () => {
    expect(sequentialOrder(4)).toEqual([0, 1, 2, 3]);
  });

  it('starts the shuffled order with the current track and keeps every track once', () => {
    const order: number[] = shuffledOrder(6, 3);

    expect(order[0]).toBe(3);
    expect([...order].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('reorders the remaining tracks randomly', () => {
    expect(shuffledOrder(4, 0, () => 0)).toEqual([0, 2, 3, 1]);
  });
});
