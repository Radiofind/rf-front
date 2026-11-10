import { NotificationTypeEnum } from '../../core/enums/notification-type.enum';

import type { NotificationType } from '../../core/types/notification-type.type';
import type { TranslationKey } from '../../core/types/translation.type';

export const NOTIFICATION_MESSAGES: Readonly<Record<NotificationType, TranslationKey>> = {
  [NotificationTypeEnum.TRACK_SUBMITTED_FOR_REVIEW]: 'notifications.trackSubmittedForReview',
  [NotificationTypeEnum.TRACK_SUBMISSION_CANCELLED]: 'notifications.trackSubmissionCancelled',
  [NotificationTypeEnum.TRACK_RESUBMITTED_FOR_REVIEW]: 'notifications.trackResubmittedForReview',
  [NotificationTypeEnum.SCHEDULE_CHANGE_REQUESTED]: 'notifications.scheduleChangeRequested',
  [NotificationTypeEnum.TRACK_DELETED]: 'notifications.trackDeleted',
};
