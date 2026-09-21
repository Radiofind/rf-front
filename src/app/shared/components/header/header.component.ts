import { Component, input, model, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PopoverComponent } from '../popover/popover.component';
import { PopoverContentDirective } from '../../directives/popover-content.directive';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [ButtonComponent, PopoverComponent, PopoverContentDirective, EmptyStateComponent],
})

export class HeaderComponent {
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
}
