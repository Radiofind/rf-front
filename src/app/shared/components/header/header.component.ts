import { Component, inject, input, model, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PopoverComponent } from '../popover/popover.component';
import { PopoverContentDirective } from '../../directives/popover-content.directive';
import { Constants } from '../../../core/constants/constants';
import { PopoverPositionEnum } from '../../../core/enums/popover-position.enum';
import { ProfileMenuItemEnum } from '../../../core/enums/profile-menu-item.enum';
import { PROFILE_MENU_ITEMS } from '../../constants/profile-menu.constant';
import { AuthService } from '../../../features/services/auth-service/auth.service';

import type { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import type { IProfileMenuItem } from '../../models/profile-menu-item.model';
import type { PopoverPosition } from '../../../core/types/popover-position.type';
import type { ProfileMenuItemType } from '../../../core/types/profile-menu-item.type';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [ButtonComponent, PopoverComponent, PopoverContentDirective, EmptyStateComponent],
})

export class HeaderComponent {
  private readonly authService: AuthService = inject(AuthService);

  public readonly isMainApplication: InputSignal<boolean> = input<boolean>(false);

  public readonly searchValue: ModelSignal<string> = model<string>(Constants.EMPTY_STRING);

  public readonly hasUnreadMessages: InputSignal<boolean> = input<boolean>(false);

  public readonly hasUnreadNotifications: InputSignal<boolean> = input<boolean>(false);

  public readonly isUserOnline: InputSignal<boolean> = input<boolean>(false);

  public readonly userAvatarUrl: InputSignal<string | null> = input<string | null>(null);

  public readonly upgradeAction: OutputEmitterRef<void> = output();

  public readonly messagesAction: OutputEmitterRef<void> = output();

  public readonly notificationsAction: OutputEmitterRef<void> = output();

  public readonly profileAction: OutputEmitterRef<void> = output();

  public readonly openProfileAction: OutputEmitterRef<void> = output();

  public readonly openSettingsAction: OutputEmitterRef<void> = output();

  public readonly logoAlt: string = Constants.HEADER_LOGO_ALT;

  public readonly brandTitle: string = Constants.HEADER_BRAND_TITLE;

  public readonly searchPlaceholder: string = Constants.HEADER_SEARCH_PLACEHOLDER;

  public readonly searchAriaLabel: string = Constants.HEADER_SEARCH_ARIA_LABEL;

  public readonly clearSearchAriaLabel: string = Constants.HEADER_CLEAR_SEARCH_ARIA_LABEL;

  public readonly messagesAriaLabel: string = Constants.HEADER_MESSAGES_ARIA_LABEL;

  public readonly notificationsAriaLabel: string = Constants.HEADER_NOTIFICATIONS_ARIA_LABEL;

  public readonly profileAriaLabel: string = Constants.HEADER_PROFILE_ARIA_LABEL;

  public readonly avatarAlt: string = Constants.HEADER_AVATAR_ALT;

  public readonly upgradeButtonText: string = Constants.HEADER_UPGRADE_BUTTON_TEXT;

  public readonly premiumButtonClass: string = Constants.HEADER_PREMIUM_BUTTON_CLASS;

  public readonly searchIconClass: string = Constants.SEARCH_ICON_CLASS;

  public readonly clearIconClass: string = Constants.CLEAR_ICON_CLASS;

  public readonly starIconClass: string = Constants.STAR_ICON_CLASS;

  public readonly mailIconClass: string = Constants.MAIL_ICON_CLASS;

  public readonly bellIconClass: string = Constants.BELL_ICON_CLASS;

  public readonly userIconClass: string = Constants.USER_ICON_CLASS;

  public readonly inboxIconClass: string = Constants.INBOX_ICON_CLASS;

  public readonly messagesTitle: string = Constants.HEADER_MESSAGES_TITLE;

  public readonly notificationsTitle: string = Constants.HEADER_NOTIFICATIONS_TITLE;

  public readonly messagesEmptyTitle: string = Constants.HEADER_MESSAGES_EMPTY_TITLE;

  public readonly messagesEmptyDescription: string = Constants.HEADER_MESSAGES_EMPTY_DESCRIPTION;

  public readonly notificationsEmptyTitle: string = Constants.HEADER_NOTIFICATIONS_EMPTY_TITLE;

  public readonly notificationsEmptyDescription: string =
    Constants.HEADER_NOTIFICATIONS_EMPTY_DESCRIPTION;

  public readonly dialogRole: string = Constants.DIALOG_ROLE;

  public readonly menuRole: string = Constants.MENU_ROLE;

  public readonly menuItemRole: string = Constants.MENU_ITEM_ROLE;

  public readonly profileMenuAriaLabel: string = Constants.HEADER_PROFILE_MENU_ARIA_LABEL;

  public readonly profileMenuPosition: PopoverPosition = PopoverPositionEnum.BOTTOM_START;

  public readonly profileMenuWidth: string = Constants.POPOVER_MENU_WIDTH;

  public readonly profileMenuPanelClass: string = Constants.POPOVER_MENU_PANEL_CLASS;

  public readonly profileMenuItems: readonly IProfileMenuItem[] = PROFILE_MENU_ITEMS;

  private readonly profileMenuActions: Readonly<Record<ProfileMenuItemType, () => void>> = {
    [ProfileMenuItemEnum.PROFILE]: (): void => {
      this.onOpenProfile();
    },
    [ProfileMenuItemEnum.SETTINGS]: (): void => {
      this.onOpenSettings();
    },
    [ProfileMenuItemEnum.LOG_OUT]: (): void => {
      this.onLogOut();
    },
  };

  public onSearchInput(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    this.searchValue.set(input.value);
  }

  public onClearSearch(): void {
    this.searchValue.set(Constants.EMPTY_STRING);
  }

  public onUpgrade(): void {
    this.upgradeAction.emit();
  }

  public onMessages(): void {
    this.messagesAction.emit();
  }

  public onNotifications(): void {
    this.notificationsAction.emit();
  }

  public onProfile(): void {
    this.profileAction.emit();
  }

  public onProfileMenuItemSelect(itemId: ProfileMenuItemType): void {
    this.profileMenuActions[itemId]();
  }

  public onOpenProfile(): void {
    this.openProfileAction.emit();
  }

  public onOpenSettings(): void {
    this.openSettingsAction.emit();
  }

  public onLogOut(): void {
    this.authService.logout();
  }
}
