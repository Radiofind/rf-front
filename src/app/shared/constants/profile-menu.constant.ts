import { ProfileMenuItemEnum } from '../../core/enums/profile-menu-item.enum';
import { Constants } from '../../core/constants/constants';

import type { IProfileMenuItem } from '../models/profile-menu-item.model';

export const PROFILE_MENU_ITEMS: readonly IProfileMenuItem[] = [
  {
    id: ProfileMenuItemEnum.ACCOUNT,
    label: 'profileMenu.account',
    iconClass: 'bx bx-user-circle',
    additionalClass: Constants.EMPTY_STRING,
    visibilityClass: 'header-menu-entry--mobile',
  },
  {
    id: ProfileMenuItemEnum.PROFILE,
    label: 'profileMenu.profile',
    iconClass: 'bx bx-user',
    additionalClass: Constants.EMPTY_STRING,
    visibilityClass: Constants.EMPTY_STRING,
  },
  {
    id: ProfileMenuItemEnum.UPGRADE,
    label: 'profileMenu.upgrade',
    iconClass: 'bxf bx-star',
    additionalClass: 'header-menu-item--premium',
    visibilityClass: 'header-menu-entry--compact',
  },
  {
    id: ProfileMenuItemEnum.SETTINGS,
    label: 'profileMenu.settings',
    iconClass: 'bx bx-cog',
    additionalClass: Constants.EMPTY_STRING,
    visibilityClass: Constants.EMPTY_STRING,
  },
  {
    id: ProfileMenuItemEnum.LOG_OUT,
    label: 'profileMenu.logOut',
    iconClass: 'bx bx-door-open',
    additionalClass: 'header-menu-item--danger',
    visibilityClass: Constants.EMPTY_STRING,
  },
];
