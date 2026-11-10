import { Constants } from '../../../core/constants/constants';
import { sequentialOrder } from '../player/player.helpers';

export function totalPages(totalElements: number, size: number): number {
  return Math.ceil(totalElements / size);
}

export function visiblePages(current: number, total: number, maxVisible: number): number[] {
  const count: number = Math.min(total, maxVisible);
  const centeredStart: number = current - Math.floor(count / Constants.TWO);
  const start: number = Math.min(Math.max(centeredStart, Constants.ZERO), total - count);

  return sequentialOrder(count).map((offset: number) => start + offset);
}
