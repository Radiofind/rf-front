import type { TranslationKey } from '../../core/types/translation.type';

export interface IErrorContent {
  code: string;
  title: TranslationKey;
  titleColor: TranslationKey;
  description: TranslationKey;
  iconClass: string;
}
