import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { Constants } from '../../core/constants/constants';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { NotificationsApiActions } from './notifications.actions';

import type { EntityAdapter, EntityState } from '@ngrx/entity';
import type { INotification, INotificationFeed } from '../../core/models/notification.model';

export interface INotificationsState extends EntityState<INotification> {
  unreadCount: number;
}

const adapter: EntityAdapter<INotification> = createEntityAdapter<INotification>();

export const initialNotificationsState: INotificationsState = adapter.getInitialState({
  unreadCount: Constants.ZERO,
});

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer(
    initialNotificationsState,
    on(
      NotificationsApiActions.notificationsLoaded,
      (state: INotificationsState, { feed }: { feed: INotificationFeed }): INotificationsState =>
        adapter.setAll([...feed.notifications], { ...state, unreadCount: feed.unreadCount }),
    ),
    on(
      NotificationsApiActions.markAllAsReadSent,
      NotificationsApiActions.allMarkedAsRead,
      (state: INotificationsState): INotificationsState => ({
        ...state,
        unreadCount: Constants.ZERO,
      }),
    ),
    on(MainLayoutActions.closed, (): INotificationsState => initialNotificationsState),
  ),
  extraSelectors: ({ selectNotificationsState, selectUnreadCount }) => ({
    selectNotifications: adapter.getSelectors(selectNotificationsState).selectAll,
    selectHasUnread: createSelector(
      selectUnreadCount,
      (unreadCount: number): boolean => unreadCount > Constants.ZERO,
    ),
  }),
});
