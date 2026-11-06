import type { TranslationKey } from '../types/translation.type';

export interface IFileRules {
  extensions: readonly string[];
  maxSizeMb: number;
  invalidTypeMessage: TranslationKey;
  tooLargeMessage: TranslationKey;
}
