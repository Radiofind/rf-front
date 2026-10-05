import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import {
  MOBILE_SIDEBAR_MENU_ITEMS,
  SIDEBAR_MENU_ITEMS,
} from '../../constants/sidebar-menu.constant';
import { UserService } from '../../services/user-service/user.service';

import type {
  InputSignal,
  ModelSignal,
  OnInit,
  OutputEmitterRef,
  Signal,
  WritableSignal,
} from '@angular/core';
import type { ISidebarMenuItem } from '../../models/sidebar-menu-item.model';
import type { ICurrentUser } from '../../../core/models/user.model';
import type { BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  imports: [RouterLink, RouterLinkActive],
})
export class SidebarMenuComponent implements OnInit {
  private readonly userService: UserService = inject(UserService);

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

  public readonly profileAction: OutputEmitterRef<void> = output();

  public readonly userName: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly userEmail: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

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
    this.profileAction.emit();
  }

  private async getCurrentUserData(): Promise<void> {
    const currentUserData: ICurrentUser = await firstValueFrom(
      this.userService.getCurrentUserData(),
    );
    const currentUserName: string =
      currentUserData.name + Constants.EMPTY_SPACE_STRING + currentUserData.surname;
    this.userName.set(currentUserName);
    this.userEmail.set(currentUserData.email);
  }
}
