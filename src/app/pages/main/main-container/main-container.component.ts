import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarMenuComponent } from '../../../features/components/sidebar-menu/sidebar-menu.component';
import { AvatarStateService } from '../../../features/services/avatar-state-service/avatar-state.service';
import { SettingsStateService } from '../../../features/services/settings-state-service/settings-state.service';
import { NotificationStateService } from '../../../features/services/notification-state-service/notification-state.service';

import type { OnDestroy, OnInit, Signal } from '@angular/core';
import type { INotification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrl: './main-container.component.scss',
  imports: [HeaderComponent, SidebarMenuComponent, RouterOutlet],
})
export class MainContainerComponent implements OnInit, OnDestroy {
  private readonly avatarStateService: AvatarStateService = inject(AvatarStateService);

  private readonly settingsStateService: SettingsStateService = inject(SettingsStateService);

  private readonly notificationStateService: NotificationStateService =
    inject(NotificationStateService);

  protected readonly avatarUrl: Signal<string | null> = this.avatarStateService.avatarUrl;

  protected readonly notifications: Signal<readonly INotification[]> =
    this.notificationStateService.notifications;

  protected readonly hasUnreadNotifications: Signal<boolean> =
    this.notificationStateService.hasUnread;

  public ngOnInit(): void {
    void this.avatarStateService.loadAvatar();
    void this.settingsStateService.loadSettings();
    void this.notificationStateService.loadNotifications();
  }

  public ngOnDestroy(): void {
    this.avatarStateService.clear();
    this.settingsStateService.clear();
    this.notificationStateService.clear();
  }

  public async onNotificationsOpen(): Promise<void> {
    await this.notificationStateService.loadNotifications();
    await this.notificationStateService.markAllAsRead();
  }
}
