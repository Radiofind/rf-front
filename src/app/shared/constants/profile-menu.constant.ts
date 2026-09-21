import { ProfileMenuItemEnum } from '../../core/enums/profile-menu-item.enum';
import { Constants } from '../../core/constants/constants';

import type { IProfileMenuItem } from '../models/profile-menu-item.model';

export const PROFILE_MENU_ITEMS: readonly IProfileMenuItem[] = [
  {
    id: ProfileMenuItemEnum.PROFILE,
    label: 'Profile',
    iconClass: 'bx bx-user',
    additionalClass: Constants.EMPTY_STRING,
  },
  {
    id: ProfileMenuItemEnum.SETTINGS,
    label: 'Settings',
    iconClass: 'bx bx-cog',
    additionalClass: Constants.EMPTY_STRING,
  },
  {
    id: ProfileMenuItemEnum.LOG_OUT,
    label: 'Log out',
    iconClass: 'bx bx-door-open',
    additionalClass: 'header-menu-item--danger',
  },
];
