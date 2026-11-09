import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideStore, provideState, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, Subject, throwError } from 'rxjs';
import { notificationsFeature } from './notifications.feature';
import * as notificationsEffects from './notifications.effects';
import { UserService } from '../../features/services/user-service/user.service';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { UploadTrackPageActions } from '../ui/upload-track-page.actions';
import { NOTIFICATIONS_PAGE_SIZE } from '../../features/constants/notification.constant';

import type { INotification } from '../../core/models/notification.model';

describe('notifications state', () => {
  const notification: INotification = {
    id: 5,
    type: 'TRACK_SUBMITTED_FOR_REVIEW',
    read: false,
    createdAt: '2026-11-05T10:00:00Z',
    track: null,
  };

  let getNotifications: ReturnType<typeof vi.fn>;
  let getUnreadNotifications: ReturnType<typeof vi.fn>;
  let markAllNotificationsAsRead: ReturnType<typeof vi.fn>;

  const configure = (platform: string): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(notificationsFeature),
        provideEffects(notificationsEffects),
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
    return TestBed.inject<Store>(Store);
  };

  const hasUnread = (store: Store): boolean =>
    store.selectSignal(notificationsFeature.selectHasUnread)();

  beforeEach(() => {
    TestBed.resetTestingModule();
    getNotifications = vi.fn().mockReturnValue(of({ items: [notification] }));
    getUnreadNotifications = vi.fn().mockReturnValue(of({ count: 1 }));
    markAllNotificationsAsRead = vi.fn().mockReturnValue(of(null));
  });

  it('loads the first page and the unread state when the layout opens', () => {
    const store: Store = configure('browser');

    store.dispatch(MainLayoutActions.opened());

    expect(getNotifications).toHaveBeenCalledWith(0, NOTIFICATIONS_PAGE_SIZE);
    expect(store.selectSignal(notificationsFeature.selectNotifications)()).toEqual([notification]);
    expect(hasUnread(store)).toBe(true);
  });

  it('reports nothing unread when every notification was read', () => {
    getUnreadNotifications.mockReturnValue(of({ count: 0 }));
    const store: Store = configure('browser');

    store.dispatch(MainLayoutActions.opened());

    expect(hasUnread(store)).toBe(false);
  });

  it('keeps the previous state when loading fails', () => {
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());
    getNotifications.mockReturnValue(throwError(() => new Error('offline')));

    store.dispatch(UploadTrackPageActions.trackUploaded());

    expect(store.selectSignal(notificationsFeature.selectNotifications)()).toEqual([notification]);
    expect(hasUnread(store)).toBe(true);
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(MainLayoutActions.opened());

    expect(getNotifications).not.toHaveBeenCalled();
  });

  it('reloads after a track was uploaded', () => {
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(UploadTrackPageActions.trackUploaded());

    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it('reloads and marks everything as read when the bell is opened', () => {
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(MainLayoutActions.notificationsOpened());

    expect(getNotifications).toHaveBeenCalledTimes(2);
    expect(markAllNotificationsAsRead).toHaveBeenCalledOnce();
    expect(hasUnread(store)).toBe(false);
  });

  it('hides the unread mark while the request to mark them read is running', () => {
    markAllNotificationsAsRead.mockReturnValue(new Subject<null>());
    const store: Store = configure('browser');

    store.dispatch(MainLayoutActions.notificationsOpened());

    expect(hasUnread(store)).toBe(false);
  });

  it('skips marking as read when nothing is unread', () => {
    getUnreadNotifications.mockReturnValue(of({ count: 0 }));
    const store: Store = configure('browser');

    store.dispatch(MainLayoutActions.notificationsOpened());

    expect(markAllNotificationsAsRead).not.toHaveBeenCalled();
  });

  it('restores the unread state from the server when marking as read fails', () => {
    markAllNotificationsAsRead.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure('browser');

    store.dispatch(MainLayoutActions.notificationsOpened());

    expect(getNotifications).toHaveBeenCalledTimes(2);
    expect(hasUnread(store)).toBe(true);
  });

  it('does not let an earlier load bring back the unread mark after the bell was opened', () => {
    const earlierPage$: Subject<{ items: INotification[] }> = new Subject<{
      items: INotification[];
    }>();
    getNotifications.mockReturnValueOnce(earlierPage$);
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(MainLayoutActions.notificationsOpened());
    earlierPage$.next({ items: [notification] });
    earlierPage$.complete();

    expect(hasUnread(store)).toBe(false);
  });

  it('forgets the notifications when the layout closes', () => {
    const store: Store = configure('browser');
    store.dispatch(MainLayoutActions.opened());

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(notificationsFeature.selectNotifications)()).toEqual([]);
    expect(hasUnread(store)).toBe(false);
  });
});
