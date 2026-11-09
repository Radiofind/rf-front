import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarMenuComponent } from '../../../features/components/sidebar-menu/sidebar-menu.component';
import { MainLayoutActions } from '../../../store/ui/main-layout.actions';
import { avatarFeature } from '../../../store/avatar/avatar.feature';
import { notificationsFeature } from '../../../store/notifications/notifications.feature';

import type { OnDestroy, OnInit, Signal } from '@angular/core';
import type { INotification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrl: './main-container.component.scss',
  imports: [HeaderComponent, SidebarMenuComponent, RouterOutlet],
})
export class MainContainerComponent implements OnInit, OnDestroy {
  private readonly store: Store = inject(Store);

  protected readonly avatarUrl: Signal<string | null> = this.store.selectSignal(
    avatarFeature.selectUrl,
  );

  protected readonly notifications: Signal<readonly INotification[]> = this.store.selectSignal(
    notificationsFeature.selectNotifications,
  );

  protected readonly hasUnreadNotifications: Signal<boolean> = this.store.selectSignal(
    notificationsFeature.selectHasUnread,
  );

  public ngOnInit(): void {
    this.store.dispatch(MainLayoutActions.opened());
  }

  public ngOnDestroy(): void {
    this.store.dispatch(MainLayoutActions.closed());
  }

  public onNotificationsOpen(): void {
    this.store.dispatch(MainLayoutActions.notificationsOpened());
  }
}
