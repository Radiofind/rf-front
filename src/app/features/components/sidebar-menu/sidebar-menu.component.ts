import { Component, computed, inject, input, model } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { Constants } from '../../../core/constants/constants';
import {
  MOBILE_SIDEBAR_MENU_ITEMS,
  SIDEBAR_MENU_ITEMS,
} from '../../constants/sidebar-menu.constant';
import { Links } from '../../../core/constants/links';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { userFeature } from '../../../store/user/user.feature';

import type { InputSignal, ModelSignal, Signal } from '@angular/core';
import type { BreakpointState } from '@angular/cdk/layout';
import type { ISidebarMenuItem } from '../../models/sidebar-menu-item.model';
import type { TranslationKey } from '../../../core/types/translation.type';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
})
export class SidebarMenuComponent {
  private readonly store: Store = inject(Store);

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

  public readonly userName: Signal<string> = this.store.selectSignal(userFeature.selectFullName);

  public readonly userEmail: Signal<string> = this.store.selectSignal(userFeature.selectEmail);

  public readonly toggleIconClass: Signal<string> = computed<string>(() =>
    this.isCollapsed() ? Constants.CHEVRON_RIGHT_ICON_CLASS : Constants.CHEVRON_LEFT_ICON_CLASS,
  );

  public readonly toggleAriaLabel: Signal<TranslationKey> = computed<TranslationKey>(() =>
    this.isCollapsed()
      ? Constants.SIDEBAR_EXPAND_ARIA_LABEL
      : Constants.SIDEBAR_COLLAPSE_ARIA_LABEL,
  );

  public onToggleCollapsed(): void {
    this.isCollapsed.update((isCollapsed: boolean) => !isCollapsed);
  }

  public onProfile(): void {
    void this.router.navigate([Links.SETTINGS_URL, Links.ACCOUNT_SETTINGS_PATH]);
  }
}
