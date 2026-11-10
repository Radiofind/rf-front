import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { UploadsEmptyStateEnum } from '../../features/enums/uploads-empty-state.enum';
import {
  MY_UPLOADS_PAGE_SIZE,
  MY_UPLOADS_VISIBLE_PAGES,
} from '../../features/constants/my-uploads.constant';
import { totalPages, visiblePages } from '../../shared/helpers/pagination/pagination.helpers';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { MyUploadsApiActions } from './my-uploads.actions';

import type { IPage } from '../../core/models/page.model';
import type { IPlayerTrack } from '../../core/models/player.model';
import type { IOwnTracksQuery, ITrack } from '../../core/models/track.model';
import type { TrackStatus } from '../../core/types/track-status.type';

export interface IMyUploadsState {
  tracks: readonly ITrack[] | null;
  totalElements: number;
  status: TrackStatus | null;
  search: string;
  page: number;
  isLoading: boolean;
  hasLoadFailed: boolean;
}

export const initialMyUploadsState: IMyUploadsState = {
  tracks: null,
  totalElements: Constants.ZERO,
  status: null,
  search: Constants.EMPTY_STRING,
  page: Constants.ZERO,
  isLoading: false,
  hasLoadFailed: false,
};

function loading(state: IMyUploadsState, changes: Partial<IMyUploadsState>): IMyUploadsState {
  return { ...state, ...changes, isLoading: true, hasLoadFailed: false };
}

export const myUploadsFeature = createFeature({
  name: 'myUploads',
  reducer: createReducer(
    initialMyUploadsState,
    on(
      MyUploadsPageActions.opened,
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
    selectPage,
    selectHasLoadFailed,
  }) => {
    const selectTrimmedSearch = createSelector(selectSearch, (search: string): string =>
      search.trim(),
    );

    const selectTotalPages = createSelector(selectTotalElements, (total: number): number =>
      totalPages(total, MY_UPLOADS_PAGE_SIZE),
    );

    return {
      selectQuery: createSelector(
        selectStatus,
        selectTrimmedSearch,
        selectPage,
        (status: TrackStatus | null, search: string, page: number): IOwnTracksQuery => ({
          status: status,
          search: search,
          page: page,
          size: MY_UPLOADS_PAGE_SIZE,
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
        (tracks: readonly ITrack[] | null, page: number): number =>
          tracks?.length ? page * MY_UPLOADS_PAGE_SIZE + Constants.ONE : Constants.ZERO,
      ),
      selectRangeEnd: createSelector(
        selectTracks,
        selectPage,
        (tracks: readonly ITrack[] | null, page: number): number =>
          page * MY_UPLOADS_PAGE_SIZE + (tracks?.length ?? Constants.ZERO),
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
                  },
                ]
              : [],
          ),
      ),
    };
  },
});
