import type { SidebarMenuItemType } from '../../core/types/sidebar-menu-item.type';

export interface ISidebarMenuItem {
  id: SidebarMenuItemType;
  label: string;
  iconClass: string;
  link: SidebarMenuItemType;
}
