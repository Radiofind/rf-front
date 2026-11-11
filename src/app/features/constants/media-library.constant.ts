import { LibrarySortEnum } from '../../core/enums/library-sort.enum';
import { SortDirectionEnum } from '../../core/enums/sort-direction.enum';
import { TrackActionEnum } from '../../core/enums/track-action.enum';
import { TrackReportReasonEnum } from '../../core/enums/track-report-reason.enum';

import type { ITrack } from '../../core/models/track.model';
import type { TranslationKey } from '../../core/types/translation.type';
import type { ISelectOption } from '../../shared/models/select-option.model';
import type { ITracksTableConfig } from '../models/tracks-table.model';

export const DEFAULT_LIBRARY_SORT: LibrarySortEnum = LibrarySortEnum.ADDED;

export const LIBRARY_FIRST_SORT_DIRECTION: Readonly<Record<LibrarySortEnum, SortDirectionEnum>> = {
  [LibrarySortEnum.TITLE]: SortDirectionEnum.ASC,
  [LibrarySortEnum.DURATION]: SortDirectionEnum.DESC,
  [LibrarySortEnum.PLAYS]: SortDirectionEnum.DESC,
  [LibrarySortEnum.LIKES]: SortDirectionEnum.DESC,
  [LibrarySortEnum.ADDED]: SortDirectionEnum.DESC,
};

export const LIBRARY_TRACK_ACTIONS: readonly TrackActionEnum[] = [
  TrackActionEnum.DETAILS,
  TrackActionEnum.REPORT,
  TrackActionEnum.REMOVE_FROM_LIBRARY,
];

export const OWN_LIBRARY_TRACK_ACTIONS: readonly TrackActionEnum[] = [
  TrackActionEnum.DETAILS,
  TrackActionEnum.REMOVE_FROM_LIBRARY,
];

export const MEDIA_LIBRARY_TABLE_CONFIG: ITracksTableConfig<LibrarySortEnum> = {
  sorts: {
    title: LibrarySortEnum.TITLE,
    duration: LibrarySortEnum.DURATION,
    plays: LibrarySortEnum.PLAYS,
    likes: LibrarySortEnum.LIKES,
    date: LibrarySortEnum.ADDED,
  },
  dateLabel: 'mediaLibrary.columns.added',
  dateOf: (track: ITrack): string | null => track.likedAt,
  hasStatus: false,
  actionsOf: (track: ITrack): readonly TrackActionEnum[] =>
    track.own ? OWN_LIBRARY_TRACK_ACTIONS : LIBRARY_TRACK_ACTIONS,
};

export const TRACK_REPORT_REASON_OPTIONS: readonly ISelectOption<
  TrackReportReasonEnum,
  TranslationKey
>[] = [
  {
    value: TrackReportReasonEnum.COPYRIGHT_INFRINGEMENT,
    label: 'mediaLibrary.report.reasons.copyrightInfringement',
  },
  {
    value: TrackReportReasonEnum.OFFENSIVE_CONTENT,
    label: 'mediaLibrary.report.reasons.offensiveContent',
  },
  { value: TrackReportReasonEnum.SPAM, label: 'mediaLibrary.report.reasons.spam' },
  {
    value: TrackReportReasonEnum.MISLEADING_INFORMATION,
    label: 'mediaLibrary.report.reasons.misleadingInformation',
  },
  {
    value: TrackReportReasonEnum.POOR_AUDIO_QUALITY,
    label: 'mediaLibrary.report.reasons.poorAudioQuality',
  },
  { value: TrackReportReasonEnum.OTHER, label: 'mediaLibrary.report.reasons.other' },
];

export const TRACK_REPORT_REASON_NEEDING_DETAILS: string = TrackReportReasonEnum.OTHER;

export const TRACK_REPORT_COMMENT_MAX_LENGTH: number = 500;

export const TRACK_REPORT_COMMENT_ROWS: number = 4;

export const MEDIA_LIBRARY_MESSAGES = {
  removed: 'messages.trackRemovedFromLibrary',
  reported: 'messages.trackReported',
  alreadyReported: 'messages.trackAlreadyReported',
  actionFailed: 'messages.trackActionFailed',
} as const satisfies Record<string, TranslationKey>;
