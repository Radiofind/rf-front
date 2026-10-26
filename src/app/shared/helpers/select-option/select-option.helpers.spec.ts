import { describe, expect, it } from 'vitest';
import {
  filterSelectOptions,
  findSelectOption,
  hasSelectOptionChildren,
} from './select-option.helpers';

import type { ISelectOption } from '../../models/select-option.model';

describe('select-option.helpers', () => {
  const options: readonly ISelectOption<string>[] = [
    { value: 'POP', label: 'Pop' },
    {
      value: 'METAL',
      label: 'Metal',
      children: [
        { value: 'THRASH_METAL', label: 'Thrash Metal' },
        { value: 'INDUSTRIAL_METAL', label: 'Industrial Metal' },
      ],
    },
  ];

  describe('hasSelectOptionChildren', () => {
    it('treats only options with a non-empty children list as groups', () => {
      expect(hasSelectOptionChildren(options[1]!)).toBe(true);
      expect(hasSelectOptionChildren(options[0]!)).toBe(false);
      expect(hasSelectOptionChildren({ value: 'JAZZ', label: 'Jazz', children: [] })).toBe(false);
    });
  });

  describe('findSelectOption', () => {
    it('finds top-level and nested options', () => {
      expect(findSelectOption(options, 'POP')?.label).toBe('Pop');
      expect(findSelectOption(options, 'INDUSTRIAL_METAL')?.label).toBe('Industrial Metal');
    });

    it('does not return groups or unknown values', () => {
      expect(findSelectOption(options, 'METAL')).toBeUndefined();
      expect(findSelectOption(options, 'JAZZ')).toBeUndefined();
      expect(findSelectOption(options, null)).toBeUndefined();
    });
  });

  describe('filterSelectOptions', () => {
    it('filters nested options and keeps their group', () => {
      const result: ISelectOption<string>[] = filterSelectOptions(
        options,
        (option: ISelectOption<string>) => option.value !== 'THRASH_METAL',
      );

      expect(result).toEqual([
        { value: 'POP', label: 'Pop' },
        {
          value: 'METAL',
          label: 'Metal',
          children: [{ value: 'INDUSTRIAL_METAL', label: 'Industrial Metal' }],
        },
      ]);
    });

    it('drops a group once all its children are filtered out', () => {
      const result: ISelectOption<string>[] = filterSelectOptions(
        options,
        (option: ISelectOption<string>) => option.value === 'POP',
      );

      expect(result).toEqual([{ value: 'POP', label: 'Pop' }]);
    });
  });
});
