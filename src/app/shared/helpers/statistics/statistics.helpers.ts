import { Constants } from '../../../core/constants/constants';

import type { ITopShare } from '../../models/top-share.model';

/** Null when the base is zero, as no change can be expressed against it. */
export function relativeChange(current: number, base: number): number | null {
  if (base === Constants.ZERO) {
    return null;
  }

  return (current - base) / base;
}

/** Everything past the leaders is pooled, so the parts still add up to the total. */
export function topShares<T>(
  items: readonly T[],
  limit: number,
  total: number,
  valueOf: (item: T) => number,
): ITopShare<T> {
  const leaders: readonly T[] = items.slice(Constants.ZERO, limit);
  const leadersValue: number = leaders.reduce(
    (sum: number, item: T) => sum + valueOf(item),
    Constants.ZERO,
  );
  const restValue: number = Math.max(total - leadersValue, Constants.ZERO);

  return {
    leaders: leaders.map((item: T) => ({
      item: item,
      value: valueOf(item),
      share: shareOf(valueOf(item), total),
    })),
    restValue: restValue,
    restShare: shareOf(restValue, total),
  };
}

function shareOf(value: number, total: number): number {
  return total > Constants.ZERO ? value / total : Constants.ZERO;
}
