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

  public readonly profileMenuPosition: PopoverPosition = PopoverPositionEnum.BOTTOM_START;

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
