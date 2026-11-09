import type { NotificationType } from '../types/notification-type.type';
import type { ITrackSummary } from './track.model';

export interface INotification {
  id: number;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  track: ITrackSummary | null;
}

export interface IUnreadNotifications {
  count: number;
}

export interface INotificationFeed {
  notifications: readonly INotification[];
  unreadCount: number;
}
