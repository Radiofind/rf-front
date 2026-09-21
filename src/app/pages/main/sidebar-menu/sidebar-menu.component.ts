import { Component, computed, input, model, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Constants } from '../../../core/constants/constants';
import { SIDEBAR_MENU_ITEMS } from '../../../features/constants/sidebar-menu.constant';

import type { InputSignal, ModelSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { ISidebarMenuItem } from '../../../features/models/sidebar-menu-item.model';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  imports: [RouterLink, RouterLinkActive],
})

export class SidebarMenuComponent {
  public readonly menuItems: InputSignal<readonly ISidebarMenuItem[]> =
    input<readonly ISidebarMenuItem[]>(SIDEBAR_MENU_ITEMS);

  public readonly isCollapsed: ModelSignal<boolean> = model<boolean>(false);

  public readonly userName: InputSignal<string> = input<string>(Constants.SIDEBAR_USER_NAME);

  public readonly userEmail: InputSignal<string> = input<string>(Constants.SIDEBAR_USER_EMAIL);

  public readonly userAvatarUrl: InputSignal<string | null> = input<string | null>(null);

  public readonly isUserOnline: InputSignal<boolean> = input<boolean>(false);

  public readonly profileAction: OutputEmitterRef<void> = output();

  public readonly navigationAriaLabel: string = Constants.SIDEBAR_NAVIGATION_ARIA_LABEL;

  public readonly profileAriaLabel: string = Constants.SIDEBAR_PROFILE_ARIA_LABEL;

  public readonly avatarAlt: string = Constants.SIDEBAR_AVATAR_ALT;

  public readonly userIconClass: string = Constants.USER_ICON_CLASS;

  public readonly chevronIconClass: string = Constants.CHEVRON_RIGHT_ICON_CLASS;

  public readonly pageAriaCurrent: string = Constants.PAGE_ARIA_CURRENT;

  public readonly navigationId: string = Constants.SIDEBAR_NAVIGATION_ID;

  public readonly toggleIconClass: Signal<string> = computed<string>(() =>
    this.isCollapsed() ? Constants.CHEVRON_RIGHT_ICON_CLASS : Constants.CHEVRON_LEFT_ICON_CLASS,
  );

  public readonly toggleAriaLabel: Signal<string> = computed<string>(() =>
    this.isCollapsed()
      ? Constants.SIDEBAR_EXPAND_ARIA_LABEL
      : Constants.SIDEBAR_COLLAPSE_ARIA_LABEL,
  );

  public onToggleCollapsed(): void {
    this.isCollapsed.update((isCollapsed: boolean) => !isCollapsed);
  }

  public onProfile(): void {
    this.profileAction.emit();
  }
}
