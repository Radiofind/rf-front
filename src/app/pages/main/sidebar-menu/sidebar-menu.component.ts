import { Component, input, model, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { SidebarMenuItemEnum } from '../../../core/enums/sidebar-menu-item.enum';
import { SIDEBAR_MENU_ITEMS } from '../../../features/constants/sidebar-menu.constant';

import type { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import type { SidebarMenuItemType } from '../../../core/types/sidebar-menu-item.type';
import type { ISidebarMenuItem } from '../../../features/models/sidebar-menu-item.model';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
})

export class SidebarMenuComponent {
  public readonly menuItems: InputSignal<readonly ISidebarMenuItem[]> =
    input<readonly ISidebarMenuItem[]>(SIDEBAR_MENU_ITEMS);

  public readonly activeItemId: ModelSignal<SidebarMenuItemType> = model<SidebarMenuItemType>(
    SidebarMenuItemEnum.MEDIA_LIBRARY,
  );

  public readonly userName: InputSignal<string> = input<string>(Constants.SIDEBAR_USER_NAME);

  public readonly userEmail: InputSignal<string> = input<string>(Constants.SIDEBAR_USER_EMAIL);

  public readonly userAvatarUrl: InputSignal<string | null> = input<string | null>(null);

  public readonly isUserOnline: InputSignal<boolean> = input<boolean>(false);

  public readonly itemAction: OutputEmitterRef<SidebarMenuItemType> = output<SidebarMenuItemType>();

  public readonly profileAction: OutputEmitterRef<void> = output();

  public readonly navigationAriaLabel: string = Constants.SIDEBAR_NAVIGATION_ARIA_LABEL;

  public readonly profileAriaLabel: string = Constants.SIDEBAR_PROFILE_ARIA_LABEL;

  public readonly avatarAlt: string = Constants.SIDEBAR_AVATAR_ALT;

  public readonly userIconClass: string = Constants.USER_ICON_CLASS;

  public readonly chevronIconClass: string = Constants.CHEVRON_RIGHT_ICON_CLASS;

  public readonly pageAriaCurrent: string = Constants.PAGE_ARIA_CURRENT;

  public onSelectItem(itemId: SidebarMenuItemType): void {
    this.activeItemId.set(itemId);
    this.itemAction.emit(itemId);
  }

  public onProfile(): void {
    this.profileAction.emit();
  }
}
