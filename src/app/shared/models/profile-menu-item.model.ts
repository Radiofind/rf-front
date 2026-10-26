import type { ProfileMenuItemType } from '../../core/types/profile-menu-item.type';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IProfileMenuItem {
  id: ProfileMenuItemType;
  label: TranslationKey;
  iconClass: string;
  additionalClass: string;
  visibilityClass: string;
}
