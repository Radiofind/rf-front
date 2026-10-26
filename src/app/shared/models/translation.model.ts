import type { ValidationError } from '@angular/forms/signals';
import type { TranslationKey, TranslationParams } from '../../core/types/translation.type';

export type TranslationDictionary = Readonly<Record<string, string>>;

export interface ITranslatableValidationError extends ValidationError {
  readonly message?: TranslationKey;
  readonly params?: TranslationParams;
}
