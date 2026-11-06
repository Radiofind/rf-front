import { computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user-service/user.service';
import { Constants } from '../../../core/constants/constants';
import { NOTIFICATIONS_PAGE_SIZE } from '../../constants/notification.constant';

import type { Signal, WritableSignal } from '@angular/core';
import type { INotification, IUnreadNotifications } from '../../../core/models/notification.model';
import type { IPage } from '../../../core/models/page.model';

@Service()
export class NotificationStateService {
  private readonly userService: UserService = inject(UserService);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly notificationsState: WritableSignal<readonly INotification[]> = signal<
    readonly INotification[]
  >([]);

  private readonly unreadCountState: WritableSignal<number> = signal<number>(Constants.ZERO);

  private requestId: number = Constants.ZERO;

  public readonly notifications: Signal<readonly INotification[]> =
    this.notificationsState.asReadonly();

  public readonly hasUnread: Signal<boolean> = computed<boolean>(
    () => this.unreadCountState() > Constants.ZERO,
  );

  public async loadNotifications(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.requestId += Constants.ONE;
    const requestId: number = this.requestId;

    try {
      const [page, unread]: [IPage<INotification>, IUnreadNotifications] = await Promise.all([
        firstValueFrom(this.userService.getNotifications(Constants.ZERO, NOTIFICATIONS_PAGE_SIZE)),
        firstValueFrom(this.userService.getUnreadNotifications()),
      ]);

      if (requestId === this.requestId) {
        this.notificationsState.set(page.items);
        this.unreadCountState.set(unread.count);
      }
    } catch {
      // The bell keeps its previous state; the next load retries.
    }
  }

  public async markAllAsRead(): Promise<void> {
    if (!this.hasUnread()) {
      return;
    }

    this.requestId += Constants.ONE;
    this.unreadCountState.set(Constants.ZERO);

    try {
      await firstValueFrom(this.userService.markAllNotificationsAsRead(), {
        defaultValue: undefined,
      });
    } catch {
      await this.loadNotifications();
    }
  }

  public clear(): void {
    this.requestId += Constants.ONE;
    this.notificationsState.set([]);
    this.unreadCountState.set(Constants.ZERO);
  }
}
