import type { EN_TRANSLATIONS } from '../i18n/translations/en.translations';

type TranslationShape<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : TranslationShape<T[K]>;
};

type TranslationPath<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : TranslationPath<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type Translations = TranslationShape<typeof EN_TRANSLATIONS>;

export type TranslationKey = TranslationPath<typeof EN_TRANSLATIONS>;

export type TranslationParams = Readonly<Record<string, string | number>>;
