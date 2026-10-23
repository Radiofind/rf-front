import { Component, computed, inject, input, model } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import {
  MOBILE_SIDEBAR_MENU_ITEMS,
  SIDEBAR_MENU_ITEMS,
} from '../../constants/sidebar-menu.constant';
import { UserService } from '../../services/user-service/user.service';
import { Links } from '../../../core/constants/links';

import type { InputSignal, ModelSignal, OnInit, Signal } from '@angular/core';
import type { BreakpointState } from '@angular/cdk/layout';
import type { ISidebarMenuItem } from '../../models/sidebar-menu-item.model';
import type { ICurrentUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  imports: [RouterLink, RouterLinkActive],
})
export class SidebarMenuComponent implements OnInit {
  private readonly userService: UserService = inject(UserService);

  private readonly router: Router = inject(Router);

  private readonly isMobile: Signal<boolean> = toSignal(
    inject(BreakpointObserver)
      .observe(Constants.MOBILE_MEDIA_QUERY)
      .pipe(map((state: BreakpointState) => state.matches)),
    { initialValue: false },
  );

  public readonly menuItems: InputSignal<readonly ISidebarMenuItem[]> =
    input<readonly ISidebarMenuItem[]>(SIDEBAR_MENU_ITEMS);

  public readonly mobileMenuItems: InputSignal<readonly ISidebarMenuItem[]> =
    input<readonly ISidebarMenuItem[]>(MOBILE_SIDEBAR_MENU_ITEMS);

  public readonly visibleMenuItems: Signal<readonly ISidebarMenuItem[]> = computed<
    readonly ISidebarMenuItem[]
  >(() => (this.isMobile() ? this.mobileMenuItems() : this.menuItems()));

  public readonly isCollapsed: ModelSignal<boolean> = model<boolean>(false);

  public readonly userAvatarUrl: InputSignal<string | null> = input<string | null>(null);

  public readonly isUserOnline: InputSignal<boolean> = input<boolean>(false);

  private readonly currentUser: Signal<ICurrentUser | null> = this.userService.currentUser;

  public readonly userName: Signal<string> = computed<string>(() => {
    const currentUser: ICurrentUser | null = this.currentUser();
    return currentUser
      ? currentUser.name + Constants.EMPTY_SPACE_STRING + currentUser.surname
      : Constants.EMPTY_STRING;
  });

  public readonly userEmail: Signal<string> = computed<string>(
    () => this.currentUser()?.email ?? Constants.EMPTY_STRING,
  );

  public readonly toggleIconClass: Signal<string> = computed<string>(() =>
    this.isCollapsed() ? Constants.CHEVRON_RIGHT_ICON_CLASS : Constants.CHEVRON_LEFT_ICON_CLASS,
  );

  public readonly toggleAriaLabel: Signal<string> = computed<string>(() =>
    this.isCollapsed()
      ? Constants.SIDEBAR_EXPAND_ARIA_LABEL
      : Constants.SIDEBAR_COLLAPSE_ARIA_LABEL,
  );

  public ngOnInit(): void {
    void this.getCurrentUserData();
  }

  public onToggleCollapsed(): void {
    this.isCollapsed.update((isCollapsed: boolean) => !isCollapsed);
  }

  public onProfile(): void {
    void this.router.navigate([Links.SETTINGS_URL, Links.ACCOUNT_SETTINGS_PATH]);
  }

  private async getCurrentUserData(): Promise<void> {
    await firstValueFrom(this.userService.getCurrentUserData());
  }
}
