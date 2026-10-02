import { ProfileMenuItemEnum } from '../../core/enums/profile-menu-item.enum';
import { Constants } from '../../core/constants/constants';

import type { IProfileMenuItem } from '../models/profile-menu-item.model';

export const PROFILE_MENU_ITEMS: readonly IProfileMenuItem[] = [
  {
    id: ProfileMenuItemEnum.ACCOUNT,
    label: 'Account',
    iconClass: 'bx bx-user-circle',
    additionalClass: Constants.EMPTY_STRING,
    visibilityClass: 'header-menu-entry--mobile',
  },
  {
    id: ProfileMenuItemEnum.PROFILE,
    label: 'Profile',
    iconClass: 'bx bx-user',
    additionalClass: Constants.EMPTY_STRING,
    visibilityClass: Constants.EMPTY_STRING,
  },
  {
    id: ProfileMenuItemEnum.UPGRADE,
    label: 'Upgrade to Premium',
    iconClass: 'bxf bx-star',
    additionalClass: 'header-menu-item--premium',
    visibilityClass: 'header-menu-entry--compact',
  },
  {
    id: ProfileMenuItemEnum.SETTINGS,
    label: 'Settings',
    iconClass: 'bx bx-cog',
    additionalClass: Constants.EMPTY_STRING,
    visibilityClass: Constants.EMPTY_STRING,
  },
  {
    id: ProfileMenuItemEnum.LOG_OUT,
    label: 'Log out',
    iconClass: 'bx bx-door-open',
    additionalClass: 'header-menu-item--danger',
    visibilityClass: Constants.EMPTY_STRING,
  },
];
