import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NotificationStateService } from './notification-state.service';
import { UserService } from '../user-service/user.service';
import { NOTIFICATIONS_PAGE_SIZE } from '../../constants/notification.constant';

import type { INotification } from '../../../core/models/notification.model';
import type { IPage } from '../../../core/models/page.model';

describe('NotificationStateService', () => {
  const notification: INotification = {
    id: 5,
    type: 'TRACK_SUBMITTED_FOR_REVIEW',
    read: false,
    createdAt: '2026-11-05T10:00:00Z',
    track: null,
  };

  const pageOf = (items: INotification[]): IPage<INotification> => ({
    items: items,
    page: 0,
    size: NOTIFICATIONS_PAGE_SIZE,
    totalElements: items.length,
    hasNext: false,
  });

  let service: NotificationStateService;
  let getNotifications: ReturnType<typeof vi.fn>;
  let getUnreadNotifications: ReturnType<typeof vi.fn>;
  let markAllNotificationsAsRead: ReturnType<typeof vi.fn>;

  const createService = (platform: string = 'browser'): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: UserService,
          useValue: {
            getNotifications: getNotifications,
            getUnreadNotifications: getUnreadNotifications,
            markAllNotificationsAsRead: markAllNotificationsAsRead,
          },
        },
      ],
    });
    service = TestBed.inject(NotificationStateService);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getNotifications = vi.fn().mockReturnValue(of(pageOf([notification])));
    getUnreadNotifications = vi.fn().mockReturnValue(of({ count: 1 }));
    markAllNotificationsAsRead = vi.fn().mockReturnValue(of(undefined));
  });

  it('loads the first page of notifications and the unread state', async () => {
    createService();

    await service.loadNotifications();

    expect(getNotifications).toHaveBeenCalledWith(0, NOTIFICATIONS_PAGE_SIZE);
    expect(service.notifications()).toEqual([notification]);
    expect(service.hasUnread()).toBe(true);
  });

  it('reports nothing unread when every notification was read', async () => {
    getUnreadNotifications.mockReturnValue(of({ count: 0 }));
    createService();

    await service.loadNotifications();

    expect(service.hasUnread()).toBe(false);
  });

  it('keeps the previous state when loading fails', async () => {
    createService();
    await service.loadNotifications();
    getNotifications.mockReturnValue(throwError(() => new Error('offline')));

    await service.loadNotifications();

    expect(service.notifications()).toEqual([notification]);
    expect(service.hasUnread()).toBe(true);
  });

  it('does not load on the server', async () => {
    createService('server');

    await service.loadNotifications();

    expect(getNotifications).not.toHaveBeenCalled();
  });

  it('marks everything as read and clears the unread state', async () => {
    createService();
    await service.loadNotifications();

    await service.markAllAsRead();

    expect(markAllNotificationsAsRead).toHaveBeenCalledOnce();
    expect(service.hasUnread()).toBe(false);
  });

  it('skips the request when nothing is unread', async () => {
    getUnreadNotifications.mockReturnValue(of({ count: 0 }));
    createService();
    await service.loadNotifications();

    await service.markAllAsRead();

    expect(markAllNotificationsAsRead).not.toHaveBeenCalled();
  });

  it('restores the unread state from the server when marking as read fails', async () => {
    createService();
    await service.loadNotifications();
    markAllNotificationsAsRead.mockReturnValue(throwError(() => new Error('offline')));

    await service.markAllAsRead();

    expect(getNotifications).toHaveBeenCalledTimes(2);
    expect(service.hasUnread()).toBe(true);
  });

  it('forgets the notifications of the previous session', async () => {
    createService();
    await service.loadNotifications();

    service.clear();

    expect(service.notifications()).toEqual([]);
    expect(service.hasUnread()).toBe(false);
  });
});
