import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concat, filter, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';
import { UserService } from '../../features/services/user-service/user.service';
import { Constants } from '../../core/constants/constants';
import { NOTIFICATIONS_PAGE_SIZE } from '../../features/constants/notification.constant';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { MyUploadsApiActions } from '../my-uploads/my-uploads.actions';
import { UploadTrackPageActions } from '../ui/upload-track-page.actions';
import { untilLayoutClosed } from '../shared/session.operators';
import { NotificationsApiActions } from './notifications.actions';

import type { Observable } from 'rxjs';
import type { Action } from '@ngrx/store';
import type {
  INotification,
  INotificationFeed,
  IUnreadNotifications,
} from '../../core/models/notification.model';
import type { IPage } from '../../core/models/page.model';

function fetchFeed(userService: UserService): Observable<INotificationFeed> {
  return forkJoin([
    userService.getNotifications(Constants.ZERO, NOTIFICATIONS_PAGE_SIZE),
    userService.getUnreadNotifications(),
  ]).pipe(
    map(([page, unread]: [IPage<INotification>, IUnreadNotifications]) => ({
      notifications: page.items,
      unreadCount: unread.count,
    })),
  );
}

export const loadNotifications = createEffect(
  (
    actions$: Actions = inject(Actions),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(
        MainLayoutActions.opened,
        UploadTrackPageActions.trackUploaded,
        MyUploadsApiActions.trackChanged,
        MyUploadsApiActions.trackDeleted,
        MyUploadsPageActions.scheduleChangeRequested,
        NotificationsApiActions.markAllAsReadFailed,
      ),
      filter(() => isPlatformBrowser(platformId)),
      switchMap(() =>
        fetchFeed(userService).pipe(
          map((feed: INotificationFeed) =>
            NotificationsApiActions.notificationsLoaded({ feed: feed }),
          ),
          catchError(() => of(NotificationsApiActions.notificationsLoadFailed())),
          takeUntil(actions$.pipe(ofType(MainLayoutActions.notificationsOpened))),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const openNotifications = createEffect(
  (
    actions$: Actions = inject(Actions),
    userService: UserService = inject(UserService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(MainLayoutActions.notificationsOpened),
      filter(() => isPlatformBrowser(platformId)),
      switchMap(() =>
        fetchFeed(userService).pipe(
          switchMap((feed: INotificationFeed): Observable<Action> => {
            const loaded: Action = NotificationsApiActions.notificationsLoaded({ feed: feed });

            if (feed.unreadCount === Constants.ZERO) {
              return of(loaded);
            }

            return concat(
              of(loaded, NotificationsApiActions.markAllAsReadSent()),
              userService.markAllNotificationsAsRead().pipe(
                map(() => NotificationsApiActions.allMarkedAsRead()),
                catchError(() => of(NotificationsApiActions.markAllAsReadFailed())),
              ),
            );
          }),
          catchError(() => of(NotificationsApiActions.notificationsLoadFailed())),
          untilLayoutClosed(actions$),
        ),
      ),
    );
  },
  { functional: true },
);
