import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { UploadsEmptyStateEnum } from '../../features/enums/uploads-empty-state.enum';
import {
  DEFAULT_UPLOADS_SORT,
  FIRST_SORT_DIRECTION,
  DEFAULT_UPLOADS_PAGE_SIZE,
  MY_UPLOADS_VISIBLE_PAGES,
  UNLIKEABLE_STATUSES,
} from '../../features/constants/my-uploads.constant';
import { SortDirectionEnum } from '../../core/enums/sort-direction.enum';
import { PlayerApiActions } from '../player/player.actions';
import { totalPages, visiblePages } from '../../shared/helpers/pagination/pagination.helpers';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { MyUploadsApiActions } from './my-uploads.actions';

import type { OwnTracksSortEnum } from '../../core/enums/own-tracks-sort.enum';
import type { IPage } from '../../core/models/page.model';
import type { IPlayerTrack } from '../../core/models/player.model';
import type { IOwnTracksQuery, ITrack } from '../../core/models/track.model';
import type { TrackStatus } from '../../core/types/track-status.type';

export interface IMyUploadsState {
  tracks: readonly ITrack[] | null;
  totalElements: number;
  status: TrackStatus | null;
  search: string;
  sort: OwnTracksSortEnum;
  direction: SortDirectionEnum;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasLoadFailed: boolean;
}

export const initialMyUploadsState: IMyUploadsState = {
  tracks: null,
  totalElements: Constants.ZERO,
  status: null,
  search: Constants.EMPTY_STRING,
  sort: DEFAULT_UPLOADS_SORT,
  direction: FIRST_SORT_DIRECTION[DEFAULT_UPLOADS_SORT],
  page: Constants.ZERO,
  pageSize: DEFAULT_UPLOADS_PAGE_SIZE,
  isLoading: false,
  hasLoadFailed: false,
};

function nextDirection(state: IMyUploadsState, sort: OwnTracksSortEnum): SortDirectionEnum {
  if (state.sort !== sort) {
    return FIRST_SORT_DIRECTION[sort];
  }

  return state.direction === SortDirectionEnum.ASC ? SortDirectionEnum.DESC : SortDirectionEnum.ASC;
}

function withSavedLike(track: ITrack, trackId: number, liked: boolean): ITrack {
  if (track.id !== trackId || track.liked === liked) {
    return track;
  }

  return {
    ...track,
    liked: liked,
    likesCount: Math.max(
      track.likesCount + (liked ? Constants.ONE : -Constants.ONE),
      Constants.ZERO,
    ),
  };
}

function loading(state: IMyUploadsState, changes: Partial<IMyUploadsState>): IMyUploadsState {
  return { ...state, ...changes, isLoading: true, hasLoadFailed: false };
}

export const myUploadsFeature = createFeature({
  name: 'myUploads',
  reducer: createReducer(
    initialMyUploadsState,
    on(
      MyUploadsPageActions.opened,
      (state: IMyUploadsState, { pageSize }: { pageSize: number | null }): IMyUploadsState =>
        loading(state, { pageSize: pageSize ?? state.pageSize }),
    ),
    on(
      MyUploadsPageActions.retryClicked,
      (state: IMyUploadsState): IMyUploadsState => loading(state, {}),
    ),
    on(
      MyUploadsPageActions.statusSelected,
      (state: IMyUploadsState, { status }: { status: TrackStatus | null }): IMyUploadsState =>
        loading(state, { status: status, page: Constants.ZERO }),
    ),
    on(
      MyUploadsPageActions.searchChanged,
      (state: IMyUploadsState, { search }: { search: string }): IMyUploadsState =>
        loading(state, { search: search, page: Constants.ZERO }),
    ),
    on(
      MyUploadsPageActions.filtersReset,
      (state: IMyUploadsState): IMyUploadsState =>
        loading(state, {
          status: null,
          search: Constants.EMPTY_STRING,
          page: Constants.ZERO,
        }),
    ),
    on(
      MyUploadsPageActions.sortSelected,
      (state: IMyUploadsState, { sort }: { sort: OwnTracksSortEnum }): IMyUploadsState =>
        loading(state, { sort: sort, direction: nextDirection(state, sort), page: Constants.ZERO }),
    ),
    on(
      PlayerApiActions.likeSaved,
      (
        state: IMyUploadsState,
        { trackId, liked }: { trackId: number; liked: boolean },
      ): IMyUploadsState => ({
        ...state,
        tracks: state.tracks?.map((track: ITrack) => withSavedLike(track, trackId, liked)) ?? null,
      }),
    ),
    on(
      MyUploadsPageActions.pageSizeSelected,
      (state: IMyUploadsState, { size }: { size: number }): IMyUploadsState =>
        loading(state, { pageSize: size, page: Constants.ZERO }),
    ),
    on(
      MyUploadsPageActions.pageSelected,
      (state: IMyUploadsState, { page }: { page: number }): IMyUploadsState =>
        loading(state, { page: page }),
    ),
    on(
      MyUploadsApiActions.uploadsLoaded,
      (state: IMyUploadsState, { page }: { page: IPage<ITrack> }): IMyUploadsState => ({
        ...state,
        tracks: page.items,
        totalElements: page.totalElements,
        page: page.page,
        isLoading: false,
        hasLoadFailed: false,
      }),
    ),
    on(
      MyUploadsApiActions.uploadsLoadFailed,
      (state: IMyUploadsState): IMyUploadsState => ({
        ...state,
        isLoading: false,
        hasLoadFailed: true,
      }),
    ),
    on(MainLayoutActions.closed, (): IMyUploadsState => initialMyUploadsState),
  ),
  extraSelectors: ({
    selectTracks,
    selectTotalElements,
    selectStatus,
    selectSearch,
    selectSort,
    selectDirection,
    selectPage,
    selectPageSize,
    selectHasLoadFailed,
  }) => {
    const selectTrimmedSearch = createSelector(selectSearch, (search: string): string =>
      search.trim(),
    );

    const selectTotalPages = createSelector(
      selectTotalElements,
      selectPageSize,
      (total: number, pageSize: number): number => totalPages(total, pageSize),
    );

    return {
      selectQuery: createSelector(
        selectStatus,
        selectTrimmedSearch,
        selectSort,
        selectDirection,
        selectPage,
        selectPageSize,
        (
          status: TrackStatus | null,
          search: string,
          sort: OwnTracksSortEnum,
          direction: SortDirectionEnum,
          page: number,
          pageSize: number,
        ): IOwnTracksQuery => ({
          status: status,
          search: search,
          sort: sort,
          direction: direction,
          page: page,
          size: pageSize,
        }),
      ),
      selectTotalPages: selectTotalPages,
      selectVisiblePages: createSelector(
        selectPage,
        selectTotalPages,
        (page: number, total: number): number[] =>
          visiblePages(page, total, MY_UPLOADS_VISIBLE_PAGES),
      ),
      selectRangeStart: createSelector(
        selectTracks,
        selectPage,
        selectPageSize,
        (tracks: readonly ITrack[] | null, page: number, pageSize: number): number =>
          tracks?.length ? page * pageSize + Constants.ONE : Constants.ZERO,
      ),
      selectRangeEnd: createSelector(
        selectTracks,
        selectPage,
        selectPageSize,
        (tracks: readonly ITrack[] | null, page: number, pageSize: number): number =>
          page * pageSize + (tracks?.length ?? Constants.ZERO),
      ),
      selectEmptyState: createSelector(
        selectTracks,
        selectHasLoadFailed,
        selectStatus,
        selectTrimmedSearch,
        (
          tracks: readonly ITrack[] | null,
          hasLoadFailed: boolean,
          status: TrackStatus | null,
          search: string,
        ): UploadsEmptyStateEnum | null => {
          if (hasLoadFailed) {
            return UploadsEmptyStateEnum.LOAD_FAILED;
          }

          if (tracks === null || tracks.length > Constants.ZERO) {
            return null;
          }

          if (search) {
            return UploadsEmptyStateEnum.NO_SEARCH_MATCH;
          }

          return status ? UploadsEmptyStateEnum.NO_STATUS_MATCH : UploadsEmptyStateEnum.NO_UPLOADS;
        },
      ),
      selectPlayerQueue: createSelector(
        selectTracks,
        (tracks: readonly ITrack[] | null): IPlayerTrack[] =>
          (tracks ?? []).flatMap((track: ITrack): IPlayerTrack[] =>
            track.audioUrl
              ? [
                  {
                    id: track.id,
                    title: track.title,
                    artistName: track.artistName,
                    coverUrl: track.coverUrl,
                    audioUrl: track.audioUrl,
                    liked: track.liked,
                    canLike: !UNLIKEABLE_STATUSES.has(track.status),
                  },
                ]
              : [],
          ),
      ),
    };
  },
});
