import { Constants } from '../../../core/constants/constants';

import type { IDonutSegment } from '../../models/chart.model';

/** Plot coordinates run from 0 to 100 on both axes, with y growing downwards. */
const PLOT_SIZE: number = 100;

const PLOT_CENTER: number = PLOT_SIZE / 2;

const DECIMAL_BASE: number = 10;

const NICE_STEP_FACTORS: readonly number[] = [1, 2, 2.5, 5, 10];

export function axisTicks(max: number, intervals: number): number[] {
  const roughStep: number = Math.max(max / intervals, Constants.ONE);
  const magnitude: number = DECIMAL_BASE ** Math.floor(Math.log10(roughStep));
  const step: number =
    NICE_STEP_FACTORS.map((factor: number) => factor * magnitude).find(
      (candidate: number) => candidate >= roughStep && Number.isInteger(candidate),
    ) ?? DECIMAL_BASE * magnitude;

  return Array.from(
    { length: intervals + Constants.ONE },
    (_: unknown, index: number) => index * step,
  );
}

export function xPosition(index: number, count: number): number {
  return count > Constants.ONE ? (index / (count - Constants.ONE)) * PLOT_SIZE : PLOT_CENTER;
}

export function yPosition(value: number, max: number): number {
  return max > Constants.ZERO ? PLOT_SIZE - (value / max) * PLOT_SIZE : PLOT_SIZE;
}

export function linePath(values: readonly number[], max: number): string {
  return values
    .map(
      (value: number, index: number) =>
        `${index === Constants.ZERO ? 'M' : 'L'}${String(xPosition(index, values.length))},${String(yPosition(value, max))}`,
    )
    .join(' ');
}

export function areaPath(values: readonly number[], max: number): string {
  if (!values.length) {
    return Constants.EMPTY_STRING;
  }

  const firstX: number = xPosition(Constants.ZERO, values.length);
  const lastX: number = xPosition(values.length - Constants.ONE, values.length);

  return `${linePath(values, max)} L${String(lastX)},${String(PLOT_SIZE)} L${String(firstX)},${String(PLOT_SIZE)} Z`;
}

export function nearestIndex(ratio: number, count: number): number {
  const index: number = Math.round(ratio * (count - Constants.ONE));

  return Math.min(Math.max(index, Constants.ZERO), count - Constants.ONE);
}

/** Segments are measured on a circle whose path length is 100; the gap keeps neighbours apart. */
export function donutSegments(shares: readonly number[], gap: number): IDonutSegment[] {
  const visibleParts: number = shares.filter((share: number) => share > Constants.ZERO).length;
  const appliedGap: number = visibleParts > Constants.ONE ? gap : Constants.ZERO;
  let start: number = Constants.ZERO;

  return shares.map((share: number) => {
    const length: number = share * PLOT_SIZE;
    const drawn: number = Math.max(length - appliedGap, Constants.ZERO);
    const segment: IDonutSegment = {
      dashArray: `${String(drawn)} ${String(PLOT_SIZE - drawn)}`,
      dashOffset: Constants.ZERO - start,
    };
    start += length;

    return segment;
  });
}
