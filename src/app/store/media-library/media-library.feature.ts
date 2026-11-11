import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { SortDirectionEnum } from '../../core/enums/sort-direction.enum';
import { LibraryEmptyStateEnum } from '../../features/enums/library-empty-state.enum';
import {
  DEFAULT_LIBRARY_SORT,
  LIBRARY_FIRST_SORT_DIRECTION,
} from '../../features/constants/media-library.constant';
import {
  DEFAULT_UPLOADS_PAGE_SIZE,
  MY_UPLOADS_VISIBLE_PAGES,
} from '../../features/constants/my-uploads.constant';
import { totalPages, visiblePages } from '../../shared/helpers/pagination/pagination.helpers';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { MediaLibraryPageActions } from '../ui/media-library-page.actions';
import { MediaLibraryApiActions } from './media-library.actions';

import type { LibrarySortEnum } from '../../core/enums/library-sort.enum';
import type { IPage } from '../../core/models/page.model';
import type { IPlayerTrack } from '../../core/models/player.model';
import type { ILibraryQuery, ITrack } from '../../core/models/track.model';

export interface IMediaLibraryState {
  tracks: readonly ITrack[] | null;
  totalElements: number;
  search: string;
  sort: LibrarySortEnum;
  direction: SortDirectionEnum;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasLoadFailed: boolean;
}

export const initialMediaLibraryState: IMediaLibraryState = {
  tracks: null,
  totalElements: Constants.ZERO,
  search: Constants.EMPTY_STRING,
  sort: DEFAULT_LIBRARY_SORT,
  direction: LIBRARY_FIRST_SORT_DIRECTION[DEFAULT_LIBRARY_SORT],
  page: Constants.ZERO,
  pageSize: DEFAULT_UPLOADS_PAGE_SIZE,
  isLoading: false,
  hasLoadFailed: false,
};

function nextDirection(state: IMediaLibraryState, sort: LibrarySortEnum): SortDirectionEnum {
  if (state.sort !== sort) {
    return LIBRARY_FIRST_SORT_DIRECTION[sort];
  }

  return state.direction === SortDirectionEnum.ASC ? SortDirectionEnum.DESC : SortDirectionEnum.ASC;
}

function loading(
  state: IMediaLibraryState,
  changes: Partial<IMediaLibraryState>,
): IMediaLibraryState {
  return { ...state, ...changes, isLoading: true, hasLoadFailed: false };
}

export const mediaLibraryFeature = createFeature({
  name: 'mediaLibrary',
  reducer: createReducer(
    initialMediaLibraryState,
    on(
      MediaLibraryPageActions.opened,
      (state: IMediaLibraryState, { pageSize }: { pageSize: number | null }): IMediaLibraryState =>
        loading(state, { pageSize: pageSize ?? state.pageSize }),
    ),
    on(
      MediaLibraryPageActions.retryClicked,
      (state: IMediaLibraryState): IMediaLibraryState => loading(state, {}),
    ),
    on(
      MediaLibraryPageActions.searchChanged,
      (state: IMediaLibraryState, { search }: { search: string }): IMediaLibraryState =>
        loading(state, { search: search, page: Constants.ZERO }),
    ),
    on(
      MediaLibraryPageActions.searchReset,
      (state: IMediaLibraryState): IMediaLibraryState =>
        loading(state, { search: Constants.EMPTY_STRING, page: Constants.ZERO }),
    ),
    on(
      MediaLibraryPageActions.sortSelected,
      (state: IMediaLibraryState, { sort }: { sort: LibrarySortEnum }): IMediaLibraryState =>
        loading(state, { sort: sort, direction: nextDirection(state, sort), page: Constants.ZERO }),
    ),
    on(
      MediaLibraryPageActions.pageSizeSelected,
      (state: IMediaLibraryState, { size }: { size: number }): IMediaLibraryState =>
        loading(state, { pageSize: size, page: Constants.ZERO }),
    ),
    on(
      MediaLibraryPageActions.pageSelected,
      (state: IMediaLibraryState, { page }: { page: number }): IMediaLibraryState =>
        loading(state, { page: page }),
    ),
    on(
      MediaLibraryApiActions.libraryLoaded,
      (state: IMediaLibraryState, { page }: { page: IPage<ITrack> }): IMediaLibraryState => ({
        ...state,
        tracks: page.items,
        totalElements: page.totalElements,
        page: page.page,
        isLoading: false,
        hasLoadFailed: false,
      }),
    ),
    on(
      MediaLibraryApiActions.libraryLoadFailed,
      (state: IMediaLibraryState): IMediaLibraryState => ({
        ...state,
        isLoading: false,
        hasLoadFailed: true,
      }),
    ),
    on(MainLayoutActions.closed, (): IMediaLibraryState => initialMediaLibraryState),
  ),
  extraSelectors: ({
    selectTracks,
    selectTotalElements,
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
      selectIsLoaded: createSelector(
        selectTracks,
        (tracks: readonly ITrack[] | null): boolean => tracks !== null,
      ),
      selectQuery: createSelector(
        selectTrimmedSearch,
        selectSort,
        selectDirection,
        selectPage,
        selectPageSize,
        (
          search: string,
          sort: LibrarySortEnum,
          direction: SortDirectionEnum,
          page: number,
          pageSize: number,
        ): ILibraryQuery => ({
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
        selectTrimmedSearch,
        (
          tracks: readonly ITrack[] | null,
          hasLoadFailed: boolean,
          search: string,
        ): LibraryEmptyStateEnum | null => {
          if (hasLoadFailed) {
            return LibraryEmptyStateEnum.LOAD_FAILED;
          }

          if (tracks === null || tracks.length > Constants.ZERO) {
            return null;
          }

          return search
            ? LibraryEmptyStateEnum.NO_SEARCH_MATCH
            : LibraryEmptyStateEnum.EMPTY_LIBRARY;
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
                    canLike: true,
                  },
                ]
              : [],
          ),
      ),
    };
  },
});
