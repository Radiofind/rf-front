import { SidebarMenuItemEnum } from '../../core/enums/sidebar-menu-item.enum';

import type { ISidebarMenuItem } from '../models/sidebar-menu-item.model';

export const SIDEBAR_MENU_ITEMS: readonly ISidebarMenuItem[] = [
  {
    id: SidebarMenuItemEnum.MEDIA_LIBRARY,
    label: 'Media Library',
    iconClass: 'bx bx-music-library',
    link: SidebarMenuItemEnum.MEDIA_LIBRARY,
  },
  {
    id: SidebarMenuItemEnum.UPLOAD_TRACK,
    label: 'Upload Track',
    iconClass: 'bx bx-arrow-up-circle',
    link: SidebarMenuItemEnum.UPLOAD_TRACK,
  },
  {
    id: SidebarMenuItemEnum.MY_UPLOADS,
    label: 'My Uploads',
    iconClass: 'bx bx-folder',
    link: SidebarMenuItemEnum.MY_UPLOADS,
  },
  {
    id: SidebarMenuItemEnum.STATISTICS,
    label: 'Statistics',
    iconClass: 'bx bx-bar-chart',
    link: SidebarMenuItemEnum.STATISTICS,
  },
  {
    id: SidebarMenuItemEnum.SUPPORT,
    label: 'Support',
    iconClass: 'bx bx-headphone',
    link: SidebarMenuItemEnum.SUPPORT,
  },
];
