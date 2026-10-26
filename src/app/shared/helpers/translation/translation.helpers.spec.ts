import { describe, expect, it } from 'vitest';
import { flattenTranslations, interpolateTranslation } from './translation.helpers';

describe('translation helpers', () => {
  describe('flattenTranslations', () => {
    it('turns a nested dictionary into dotted keys', () => {
      expect(
        flattenTranslations({ common: { save: 'Save', nested: { deep: 'Deep' } }, title: 'Title' }),
      ).toEqual({ 'common.save': 'Save', 'common.nested.deep': 'Deep', title: 'Title' });
    });
  });

  describe('interpolateTranslation', () => {
    it('replaces every known placeholder', () => {
      expect(interpolateTranslation('{a} and {b} and {a}', { a: 1, b: 'two' })).toBe(
        '1 and two and 1',
      );
    });

    it('keeps placeholders without a value', () => {
      expect(interpolateTranslation('Remove {item}', {})).toBe('Remove {item}');
    });
  });
});
