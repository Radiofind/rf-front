import type { AccentColor } from '../../core/types/accent-color.type';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IAccentColorOption {
  value: AccentColor;
  label: TranslationKey;
  firstColor: string;
  secondColor: string;
  mainColor: string;
}
