import { describe, expect, it } from 'vitest';
import { areaPath, axisTicks, donutSegments, linePath, nearestIndex } from './chart.helpers';

describe('chart helpers', () => {
  it.each([
    [0, [0, 1, 2, 3, 4]],
    [7, [0, 2, 4, 6, 8]],
    [278, [0, 100, 200, 300, 400]],
    [90, [0, 25, 50, 75, 100]],
  ])('rounds an axis up to whole steps for a maximum of %i', (max: number, ticks: number[]) => {
    expect(axisTicks(max, 4)).toEqual(ticks);
  });

  it('draws a line from the first to the last point across the whole width', () => {
    expect(linePath([0, 5, 10], 10)).toBe('M0,100 L50,50 L100,0');
  });

  it('closes the area along the baseline', () => {
    expect(areaPath([0, 10], 10)).toBe('M0,100 L100,0 L100,100 L0,100 Z');
  });

  it.each([
    [0, 0],
    [0.49, 15],
    [1, 30],
    [1.2, 30],
  ])('picks the point nearest to %f of the width among 31', (ratio: number, index: number) => {
    expect(nearestIndex(ratio, 31)).toBe(index);
  });

  it('places the segments one after another with a gap between them', () => {
    expect(donutSegments([0.5, 0.25, 0.25], 1)).toEqual([
      { dashArray: '49 51', dashOffset: 0 },
      { dashArray: '24 76', dashOffset: -50 },
      { dashArray: '24 76', dashOffset: -75 },
    ]);
  });

  it('closes a lone segment into a full ring', () => {
    expect(donutSegments([1], 1)).toEqual([{ dashArray: '100 0', dashOffset: 0 }]);
  });
});
