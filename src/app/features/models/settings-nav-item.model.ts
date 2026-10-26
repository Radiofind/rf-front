import type { TranslationKey } from '../../core/types/translation.type';

export interface ISettingsNavItem {
  label: TranslationKey;
  iconClass: string;
  link: string;
}
