import { describe, expect, it } from 'vitest';
import { EN_TRANSLATIONS } from './en.translations';
import { DE_TRANSLATIONS } from './de.translations';
import { FR_TRANSLATIONS } from './fr.translations';
import { IT_TRANSLATIONS } from './it.translations';
import { ES_TRANSLATIONS } from './es.translations';
import { RU_TRANSLATIONS } from './ru.translations';
import { flattenTranslations } from '../../../shared/helpers/translation/translation.helpers';
import { Constants } from '../../constants/constants';

import type { TranslationDictionary } from '../../../shared/models/translation.model';

const placeholdersOf = (text: string): string[] =>
  Array.from(text.matchAll(Constants.TRANSLATION_PARAM_PATTERN), (match) => match[0]).sort();

describe('translations', () => {
  const english: TranslationDictionary = flattenTranslations(EN_TRANSLATIONS);

  it.each([
    ['DE', DE_TRANSLATIONS],
    ['FR', FR_TRANSLATIONS],
    ['IT', IT_TRANSLATIONS],
    ['ES', ES_TRANSLATIONS],
    ['RU', RU_TRANSLATIONS],
  ] as const)('%s provides every key with the same placeholders', (_language, translations) => {
    const dictionary: TranslationDictionary = flattenTranslations(translations);

    expect(Object.keys(dictionary).sort()).toEqual(Object.keys(english).sort());

    Object.entries(english).forEach(([key, text]: [string, string]) => {
      const translated: string = dictionary[key] ?? '';

      expect(translated.trim(), key).not.toBe('');
      expect(placeholdersOf(translated), key).toEqual(placeholdersOf(text));
    });
  });
});
