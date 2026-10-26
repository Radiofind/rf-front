import { LanguageEnum } from '../enums/language.enum';
import { EN_TRANSLATIONS } from './translations/en.translations';

import type { Language } from '../types/language.type';
import type { Translations } from '../types/translation.type';

export const DEFAULT_LANGUAGE: Language = LanguageEnum.EN;

export const FALLBACK_TRANSLATIONS: Translations = EN_TRANSLATIONS;

export const LANGUAGE_LOCALES: Readonly<Record<Language, string>> = {
  [LanguageEnum.EN]: 'en-US',
  [LanguageEnum.DE]: 'de-DE',
  [LanguageEnum.FR]: 'fr-FR',
  [LanguageEnum.IT]: 'it-IT',
  [LanguageEnum.ES]: 'es-ES',
  [LanguageEnum.RU]: 'ru-RU',
};

export const TRANSLATION_LOADERS: Readonly<Record<Language, () => Promise<Translations>>> = {
  [LanguageEnum.EN]: () => Promise.resolve(EN_TRANSLATIONS),
  [LanguageEnum.DE]: () => import('./translations/de.translations').then((m) => m.DE_TRANSLATIONS),
  [LanguageEnum.FR]: () => import('./translations/fr.translations').then((m) => m.FR_TRANSLATIONS),
  [LanguageEnum.IT]: () => import('./translations/it.translations').then((m) => m.IT_TRANSLATIONS),
  [LanguageEnum.ES]: () => import('./translations/es.translations').then((m) => m.ES_TRANSLATIONS),
  [LanguageEnum.RU]: () => import('./translations/ru.translations').then((m) => m.RU_TRANSLATIONS),
};
