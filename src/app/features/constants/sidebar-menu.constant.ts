import { SidebarMenuItemEnum } from '../../core/enums/sidebar-menu-item.enum';

import type { ISidebarMenuItem } from '../models/sidebar-menu-item.model';

const MEDIA_LIBRARY_ITEM: ISidebarMenuItem = {
  id: SidebarMenuItemEnum.MEDIA_LIBRARY,
  label: 'Media Library',
  iconClass: 'bx bx-music-library',
  link: SidebarMenuItemEnum.MEDIA_LIBRARY,
};

const UPLOAD_TRACK_ITEM: ISidebarMenuItem = {
  id: SidebarMenuItemEnum.UPLOAD_TRACK,
  label: 'Upload Track',
  iconClass: 'bx bx-arrow-up-circle',
  link: SidebarMenuItemEnum.UPLOAD_TRACK,
};

const MY_UPLOADS_ITEM: ISidebarMenuItem = {
  id: SidebarMenuItemEnum.MY_UPLOADS,
  label: 'My Uploads',
  iconClass: 'bx bx-folder',
  link: SidebarMenuItemEnum.MY_UPLOADS,
};

const STATISTICS_ITEM: ISidebarMenuItem = {
  id: SidebarMenuItemEnum.STATISTICS,
  label: 'Statistics',
  iconClass: 'bx bx-bar-chart',
  link: SidebarMenuItemEnum.STATISTICS,
};

const SUPPORT_ITEM: ISidebarMenuItem = {
  id: SidebarMenuItemEnum.SUPPORT,
  label: 'Support',
  iconClass: 'bx bx-headphone',
  link: SidebarMenuItemEnum.SUPPORT,
};

export const SIDEBAR_MENU_ITEMS: readonly ISidebarMenuItem[] = [
  MEDIA_LIBRARY_ITEM,
  UPLOAD_TRACK_ITEM,
  MY_UPLOADS_ITEM,
  STATISTICS_ITEM,
  SUPPORT_ITEM,
];

export const MOBILE_SIDEBAR_MENU_ITEMS: readonly ISidebarMenuItem[] = [
  MY_UPLOADS_ITEM,
  UPLOAD_TRACK_ITEM,
  MEDIA_LIBRARY_ITEM,
  STATISTICS_ITEM,
  SUPPORT_ITEM,
];
