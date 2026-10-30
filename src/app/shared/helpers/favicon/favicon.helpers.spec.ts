import { describe, expect, it } from 'vitest';
import { createAudiowaveFavicon } from './favicon.helpers';

describe('favicon.helpers', () => {
  describe('createAudiowaveFavicon', () => {
    it('returns an svg data url', () => {
      expect(createAudiowaveFavicon('#22d3ee', '#0284c7')).toMatch(/^data:image\/svg\+xml,/);
    });

    it('paints the gradient from the top color to the bottom color', () => {
      const svg: string = decodeURIComponent(createAudiowaveFavicon('#22d3ee', '#0284c7'));

      expect(svg).toContain('<stop offset="0" stop-color="#22d3ee"/>');
      expect(svg).toContain('<stop offset="1" stop-color="#0284c7"/>');
    });
  });
});
