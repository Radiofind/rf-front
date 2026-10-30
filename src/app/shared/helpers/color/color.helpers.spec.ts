import { describe, expect, it } from 'vitest';
import { getHue, getHueShift } from './color.helpers';

describe('color.helpers', () => {
  describe('getHue', () => {
    it.each([
      ['#ff0000', 0],
      ['#00ff00', 120],
      ['#0000ff', 240],
      ['#ff00ff', 300],
    ])('returns the hue of %s as %i degrees', (hexColor: string, hue: number) => {
      expect(getHue(hexColor)).toBe(hue);
    });

    it('treats a gray without hue as zero degrees', () => {
      expect(getHue('#808080')).toBe(0);
    });
  });

  describe('getHueShift', () => {
    it('is zero between the same color', () => {
      expect(getHueShift('#712be2', '#712be2')).toBe(0);
    });

    it('rotates backwards from violet to ocean blue', () => {
      expect(getHueShift('#712be2', '#0284c7')).toBe(-63);
    });

    it('takes the short way across red instead of the long way round', () => {
      expect(getHueShift('#ff00ff', '#ff0000')).toBe(60);
    });
  });
});
