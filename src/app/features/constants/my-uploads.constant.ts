import { OwnTracksSortEnum } from '../../core/enums/own-tracks-sort.enum';
import { SortDirectionEnum } from '../../core/enums/sort-direction.enum';
import { TrackActionEnum } from '../../core/enums/track-action.enum';
import { TrackStatusEnum } from '../../core/enums/track-status.enum';
import { GENRE_OPTIONS } from './genre.constant';

import type { ITrack } from '../../core/models/track.model';
import type { TrackStatus } from '../../core/types/track-status.type';
import type { TranslationKey } from '../../core/types/translation.type';
import type { ISelectOption } from '../../shared/models/select-option.model';
import type { IUploadsStatusTab } from '../models/uploads-status-tab.model';
import type { ITrackActionOption } from '../models/track-action-option.model';
import type { ITracksTableConfig } from '../models/tracks-table.model';

export const DEFAULT_UPLOADS_PAGE_SIZE: number = 10;

export const UPLOADS_PAGE_SIZE_OPTIONS: readonly ISelectOption<string>[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
];

export const MY_UPLOADS_SEARCH_DEBOUNCE_MS: number = 300;

export const MY_UPLOADS_SEARCH_MAX_LENGTH: number = 150;

export const MY_UPLOADS_VISIBLE_PAGES: number = 5;

export const DEFAULT_UPLOADS_SORT: OwnTracksSortEnum = OwnTracksSortEnum.UPLOADED;

export const FIRST_SORT_DIRECTION: Readonly<Record<OwnTracksSortEnum, SortDirectionEnum>> = {
  [OwnTracksSortEnum.TITLE]: SortDirectionEnum.ASC,
  [OwnTracksSortEnum.DURATION]: SortDirectionEnum.DESC,
  [OwnTracksSortEnum.PLAYS]: SortDirectionEnum.DESC,
  [OwnTracksSortEnum.LIKES]: SortDirectionEnum.DESC,
  [OwnTracksSortEnum.UPLOADED]: SortDirectionEnum.DESC,
};

export const SORT_ICON_CLASSES: Readonly<Record<SortDirectionEnum, string>> = {
  [SortDirectionEnum.ASC]: 'bx bx-caret-up',
  [SortDirectionEnum.DESC]: 'bx bx-caret-down',
};

export const UNSORTED_ICON_CLASS: string = 'bx bx-carets-up-down';

export const MY_UPLOADS_SKELETON_ROWS: readonly number[] = [1, 2, 3, 4, 5];

export const UPLOADS_STATUS_TABS: readonly IUploadsStatusTab[] = [
  { status: null, label: 'myUploads.tabs.all' },
  { status: TrackStatusEnum.APPROVED, label: 'myUploads.tabs.published' },
  { status: TrackStatusEnum.PENDING_REVIEW, label: 'myUploads.tabs.processing' },
  { status: TrackStatusEnum.REJECTED, label: 'myUploads.tabs.rejected' },
  { status: TrackStatusEnum.DRAFT, label: 'myUploads.tabs.drafts' },
];

export const UNLIKEABLE_STATUSES: ReadonlySet<TrackStatus> = new Set<TrackStatus>([
  TrackStatusEnum.DRAFT,
  TrackStatusEnum.PENDING_REVIEW,
]);

export const TRACK_STATUS_LABELS: Readonly<Record<TrackStatus, TranslationKey>> = {
  [TrackStatusEnum.DRAFT]: 'myUploads.status.draft',
  [TrackStatusEnum.APPROVED]: 'myUploads.status.published',
  [TrackStatusEnum.PENDING_REVIEW]: 'myUploads.status.processing',
  [TrackStatusEnum.REJECTED]: 'myUploads.status.rejected',
};

export const NO_STATUS_MATCH_TITLES: Readonly<Record<TrackStatus, TranslationKey>> = {
  [TrackStatusEnum.DRAFT]: 'myUploads.empty.noDraftsTitle',
  [TrackStatusEnum.APPROVED]: 'myUploads.empty.noPublishedTitle',
  [TrackStatusEnum.PENDING_REVIEW]: 'myUploads.empty.noProcessingTitle',
  [TrackStatusEnum.REJECTED]: 'myUploads.empty.noRejectedTitle',
};

export const NO_STATUS_MATCH_DESCRIPTIONS: Readonly<Record<TrackStatus, TranslationKey>> = {
  [TrackStatusEnum.DRAFT]: 'myUploads.empty.noDraftsDescription',
  [TrackStatusEnum.APPROVED]: 'myUploads.empty.noPublishedDescription',
  [TrackStatusEnum.PENDING_REVIEW]: 'myUploads.empty.noProcessingDescription',
  [TrackStatusEnum.REJECTED]: 'myUploads.empty.noRejectedDescription',
};

function collectGenreLabels(
  options: readonly ISelectOption<string, TranslationKey>[],
): [string, TranslationKey][] {
  return options.flatMap((option: ISelectOption<string, TranslationKey>) =>
    option.children?.length
      ? collectGenreLabels(option.children)
      : [[option.value, option.label] as [string, TranslationKey]],
  );
}

export const GENRE_LABELS: ReadonlyMap<string, TranslationKey> = new Map<string, TranslationKey>(
  collectGenreLabels(GENRE_OPTIONS),
);

export const TRACK_ACTION_OPTIONS: Readonly<Record<TrackActionEnum, ITrackActionOption>> = {
  [TrackActionEnum.DETAILS]: {
    action: TrackActionEnum.DETAILS,
    label: 'myUploads.actions.details',
    iconClass: 'bx bx-info-circle',
    isDanger: false,
  },
  [TrackActionEnum.EDIT]: {
    action: TrackActionEnum.EDIT,
    label: 'myUploads.actions.edit',
    iconClass: 'bx bx-edit',
    isDanger: false,
  },
  [TrackActionEnum.STATISTICS]: {
    action: TrackActionEnum.STATISTICS,
    label: 'myUploads.actions.statistics',
    iconClass: 'bx bx-bar-chart',
    isDanger: false,
  },
  [TrackActionEnum.SCHEDULE]: {
    action: TrackActionEnum.SCHEDULE,
    label: 'myUploads.actions.schedule',
    iconClass: 'bx bx-calendar-event',
    isDanger: false,
  },
  [TrackActionEnum.REQUEST_SCHEDULE_CHANGE]: {
    action: TrackActionEnum.REQUEST_SCHEDULE_CHANGE,
    label: 'myUploads.actions.requestScheduleChange',
    iconClass: 'bx bx-clock',
    isDanger: false,
  },
  [TrackActionEnum.REJECTION_REASON]: {
    action: TrackActionEnum.REJECTION_REASON,
    label: 'myUploads.actions.rejectionReason',
    iconClass: 'bx bx-message-x',
    isDanger: false,
  },
  [TrackActionEnum.SUBMIT]: {
    action: TrackActionEnum.SUBMIT,
    label: 'myUploads.actions.submit',
    iconClass: 'bx bx-send',
    isDanger: false,
  },
  [TrackActionEnum.RESUBMIT]: {
    action: TrackActionEnum.RESUBMIT,
    label: 'myUploads.actions.resubmit',
    iconClass: 'bx bx-refresh-cw',
    isDanger: false,
  },
  [TrackActionEnum.CANCEL_SUBMISSION]: {
    action: TrackActionEnum.CANCEL_SUBMISSION,
    label: 'myUploads.actions.cancelSubmission',
    iconClass: 'bx bx-undo',
    isDanger: false,
  },
  [TrackActionEnum.DOWNLOAD]: {
    action: TrackActionEnum.DOWNLOAD,
    label: 'myUploads.actions.download',
    iconClass: 'bx bx-arrow-down-circle',
    isDanger: false,
  },
  [TrackActionEnum.DELETE]: {
    action: TrackActionEnum.DELETE,
    label: 'myUploads.actions.delete',
    iconClass: 'bx bx-trash',
    isDanger: true,
  },
  [TrackActionEnum.REPORT]: {
    action: TrackActionEnum.REPORT,
    label: 'mediaLibrary.actions.report',
    iconClass: 'bx bx-flag',
    isDanger: false,
  },
  [TrackActionEnum.REMOVE_FROM_LIBRARY]: {
    action: TrackActionEnum.REMOVE_FROM_LIBRARY,
    label: 'mediaLibrary.actions.remove',
    iconClass: 'bx bx-heart-break',
    isDanger: true,
  },
};

export const TRACK_ACTIONS_BY_STATUS: Readonly<Record<TrackStatus, readonly TrackActionEnum[]>> = {
  [TrackStatusEnum.PENDING_REVIEW]: [
    TrackActionEnum.DETAILS,
    TrackActionEnum.EDIT,
    TrackActionEnum.DOWNLOAD,
    TrackActionEnum.CANCEL_SUBMISSION,
    TrackActionEnum.DELETE,
  ],
  [TrackStatusEnum.APPROVED]: [
    TrackActionEnum.DETAILS,
    TrackActionEnum.STATISTICS,
    TrackActionEnum.SCHEDULE,
    TrackActionEnum.REQUEST_SCHEDULE_CHANGE,
    TrackActionEnum.DOWNLOAD,
    TrackActionEnum.DELETE,
  ],
  [TrackStatusEnum.REJECTED]: [
    TrackActionEnum.DETAILS,
    TrackActionEnum.EDIT,
    TrackActionEnum.REJECTION_REASON,
    TrackActionEnum.RESUBMIT,
    TrackActionEnum.DOWNLOAD,
    TrackActionEnum.DELETE,
  ],
  [TrackStatusEnum.DRAFT]: [
    TrackActionEnum.DETAILS,
    TrackActionEnum.EDIT,
    TrackActionEnum.SUBMIT,
    TrackActionEnum.DOWNLOAD,
    TrackActionEnum.DELETE,
  ],
};

export const MY_UPLOADS_TABLE_CONFIG: ITracksTableConfig<OwnTracksSortEnum> = {
  sorts: {
    title: OwnTracksSortEnum.TITLE,
    duration: OwnTracksSortEnum.DURATION,
    plays: OwnTracksSortEnum.PLAYS,
    likes: OwnTracksSortEnum.LIKES,
    date: OwnTracksSortEnum.UPLOADED,
  },
  dateLabel: 'myUploads.columns.uploaded',
  dateOf: (track: ITrack): string => track.createdAt,
  hasStatus: true,
  actionsOf: (track: ITrack): readonly TrackActionEnum[] => TRACK_ACTIONS_BY_STATUS[track.status],
};

export const MY_UPLOADS_MESSAGES = {
  submissionCancelled: 'messages.submissionCancelled',
  submitted: 'messages.trackSubmitted',
  resubmitted: 'messages.trackResubmitted',
  deleted: 'messages.trackDeleted',
  edited: 'messages.trackUpdated',
  scheduleChangeRequested: 'messages.scheduleChangeRequested',
  scheduleChangeAlreadyPending: 'messages.scheduleChangeAlreadyPending',
  actionFailed: 'messages.trackActionFailed',
} as const satisfies Record<string, TranslationKey>;

export const SCHEDULE_CHANGE_COMMENT_MAX_LENGTH: number = 500;

export const SCHEDULE_CHANGE_COMMENT_MAX_LENGTH_MESSAGE: TranslationKey =
  'validation.maxLengthComment';

export const SCHEDULE_CHANGE_DATE_MESSAGE: TranslationKey = 'validation.dateFromTomorrow';

export const EDIT_DESCRIPTION_ROWS: number = 3;

export const SCHEDULE_CHANGE_COMMENT_ROWS: number = 4;

export const SCHEDULE_CHANGE_HOURS: readonly string[] = Array.from(
  { length: 24 },
  (_: unknown, hour: number) => `${String(hour).padStart(2, '0')}:00`,
);
