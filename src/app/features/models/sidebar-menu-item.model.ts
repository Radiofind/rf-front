import type { SidebarMenuItemType } from '../../core/types/sidebar-menu-item.type';
import type { TranslationKey } from '../../core/types/translation.type';

export interface ISidebarMenuItem {
  id: SidebarMenuItemType;
  label: TranslationKey;
  iconClass: string;
  link: SidebarMenuItemType;
}
