import { EN_TRANSLATIONS } from './app/core/i18n/translations/en.translations';
import {
  flattenTranslations,
  interpolateTranslation,
} from './app/shared/helpers/translation/translation.helpers';

import type { TranslationKey, TranslationParams } from './app/core/types/translation.type';
import type { TranslationDictionary } from './app/shared/models/translation.model';

const EN_DICTIONARY: TranslationDictionary = flattenTranslations(EN_TRANSLATIONS);

export function translate(key: TranslationKey, params?: TranslationParams): string {
  const template: string = EN_DICTIONARY[key] ?? key;
  return params ? interpolateTranslation(template, params) : template;
}
