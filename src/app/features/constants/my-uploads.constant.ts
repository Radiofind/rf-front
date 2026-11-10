import { TrackStatusEnum } from '../../core/enums/track-status.enum';
import { GENRE_OPTIONS } from './genre.constant';

import type { TrackStatus } from '../../core/types/track-status.type';
import type { TranslationKey } from '../../core/types/translation.type';
import type { ISelectOption } from '../../shared/models/select-option.model';
import type { IUploadsStatusTab } from '../models/uploads-status-tab.model';

export const MY_UPLOADS_PAGE_SIZE: number = 10;

export const MY_UPLOADS_SEARCH_DEBOUNCE_MS: number = 300;

export const MY_UPLOADS_SEARCH_MAX_LENGTH: number = 150;

export const MY_UPLOADS_VISIBLE_PAGES: number = 5;

export const MY_UPLOADS_SKELETON_ROWS: readonly number[] = [1, 2, 3, 4, 5];

export const UPLOADS_STATUS_TABS: readonly IUploadsStatusTab[] = [
  { status: null, label: 'myUploads.tabs.all' },
  { status: TrackStatusEnum.APPROVED, label: 'myUploads.tabs.published' },
  { status: TrackStatusEnum.PENDING_REVIEW, label: 'myUploads.tabs.processing' },
  { status: TrackStatusEnum.REJECTED, label: 'myUploads.tabs.rejected' },
];

export const TRACK_STATUS_LABELS: Readonly<Record<TrackStatus, TranslationKey>> = {
  [TrackStatusEnum.APPROVED]: 'myUploads.status.published',
  [TrackStatusEnum.PENDING_REVIEW]: 'myUploads.status.processing',
  [TrackStatusEnum.REJECTED]: 'myUploads.status.rejected',
};

export const NO_STATUS_MATCH_TITLES: Readonly<Record<TrackStatus, TranslationKey>> = {
  [TrackStatusEnum.APPROVED]: 'myUploads.empty.noPublishedTitle',
  [TrackStatusEnum.PENDING_REVIEW]: 'myUploads.empty.noProcessingTitle',
  [TrackStatusEnum.REJECTED]: 'myUploads.empty.noRejectedTitle',
};

export const NO_STATUS_MATCH_DESCRIPTIONS: Readonly<Record<TrackStatus, TranslationKey>> = {
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
