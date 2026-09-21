import type { ProfileMenuItemType } from '../../core/types/profile-menu-item.type';

export interface IProfileMenuItem {
  id: ProfileMenuItemType;
  label: string;
  iconClass: string;
  additionalClass: string;
}
