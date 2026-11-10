import { ActivityTypeEnum } from '../../core/enums/activity-type.enum';

import type { ActivityType } from '../../core/types/activity-type.type';
import type { TranslationKey } from '../../core/types/translation.type';

export const ACTIVITY_LABELS: Readonly<Record<ActivityType, TranslationKey>> = {
  [ActivityTypeEnum.TRACK_UPLOADED]: 'profile.uploaded',
  [ActivityTypeEnum.TRACK_SUBMISSION_CANCELLED]: 'profile.submissionCancelled',
  [ActivityTypeEnum.TRACK_RESUBMITTED]: 'profile.resubmitted',
  [ActivityTypeEnum.SCHEDULE_CHANGE_REQUESTED]: 'profile.scheduleChangeRequested',
};
