import { computed, DOCUMENT, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Constants } from '../../../core/constants/constants';
import {
  DEFAULT_LANGUAGE,
  FALLBACK_TRANSLATIONS,
  LANGUAGE_LOCALES,
  TRANSLATION_LOADERS,
} from '../../../core/i18n/translation.config';
import {
  flattenTranslations,
  interpolateTranslation,
} from '../../helpers/translation/translation.helpers';

import type { Signal, WritableSignal } from '@angular/core';
import type { Language } from '../../../core/types/language.type';
import type {
  TranslationKey,
  TranslationParams,
  Translations,
} from '../../../core/types/translation.type';
import type { ISelectOption } from '../../models/select-option.model';
import type { TranslationDictionary } from '../../models/translation.model';

@Service()
export class TranslationService {
  private readonly document: Document = inject(DOCUMENT);

  private readonly title: Title = inject(Title);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly fallbackDictionary: TranslationDictionary =
    flattenTranslations(FALLBACK_TRANSLATIONS);

  private readonly dictionaries: Map<Language, TranslationDictionary> = new Map<
    Language,
    TranslationDictionary
  >([[DEFAULT_LANGUAGE, this.fallbackDictionary]]);

  private readonly languageState: WritableSignal<Language> = signal<Language>(DEFAULT_LANGUAGE);

  private readonly dictionaryState: WritableSignal<TranslationDictionary> =
    signal<TranslationDictionary>(this.fallbackDictionary);

  private requestId: number = Constants.ZERO;

  public readonly language: Signal<Language> = this.languageState.asReadonly();

  public readonly locale: Signal<string> = computed<string>(
    () => LANGUAGE_LOCALES[this.languageState()],
  );

  public init(): Promise<void> {
    return this.use(this.readStoredLanguage() ?? DEFAULT_LANGUAGE);
  }

  public async use(language: Language): Promise<void> {
    this.requestId += Constants.ONE;
    const requestId: number = this.requestId;

    try {
      const dictionary: TranslationDictionary = await this.loadDictionary(language);

      if (requestId !== this.requestId) {
        return;
      }

      this.dictionaryState.set(dictionary);
      this.languageState.set(language);
      this.applyDocumentLanguage(language);
      this.storeLanguage(language);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  public translate(key: TranslationKey, params?: TranslationParams): string {
    const template: string = this.dictionaryState()[key] ?? this.fallbackDictionary[key] ?? key;

    return params ? interpolateTranslation(template, params) : template;
  }

  public translateOptions<T extends string>(
    options: readonly ISelectOption<T, TranslationKey>[],
  ): ISelectOption<T>[] {
    return options.map((option: ISelectOption<T, TranslationKey>) => ({
      value: option.value,
      label: this.translate(option.label),
      children: option.children && this.translateOptions(option.children),
    }));
  }

  public formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return new Intl.RelativeTimeFormat(this.locale(), { numeric: 'auto' }).format(value, unit);
  }

  private async loadDictionary(language: Language): Promise<TranslationDictionary> {
    const cached: TranslationDictionary | undefined = this.dictionaries.get(language);

    if (cached) {
      return cached;
    }

    const translations: Translations = await TRANSLATION_LOADERS[language]();
    const dictionary: TranslationDictionary = flattenTranslations(translations);

    this.dictionaries.set(language, dictionary);

    return dictionary;
  }

  private applyDocumentLanguage(language: Language): void {
    this.document.documentElement.lang = language.toLowerCase();
    this.title.setTitle(this.translate('app.title'));
  }

  private readStoredLanguage(): Language | null {
    if (!this.isBrowser) {
      return null;
    }

    const language: string | null = localStorage.getItem(Constants.LANGUAGE_KEY);

    return language && language in LANGUAGE_LOCALES ? (language as Language) : null;
  }

  private storeLanguage(language: Language): void {
    if (this.isBrowser) {
      localStorage.setItem(Constants.LANGUAGE_KEY, language);
    }
  }
}
