import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { mediaLibraryFeature } from './media-library.feature';
import * as mediaLibraryEffects from './media-library.effects';
import { MediaLibraryPageActions } from '../ui/media-library-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { PlayerApiActions } from '../player/player.actions';
import { TrackService } from '../../features/services/track-service/track.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { UploadsPreferencesService } from '../../features/services/uploads-preferences-service/uploads-preferences.service';
import { LibraryEmptyStateEnum } from '../../features/enums/library-empty-state.enum';
import { LibrarySortEnum } from '../../core/enums/library-sort.enum';
import { TrackStatusEnum } from '../../core/enums/track-status.enum';

import type { IPage } from '../../core/models/page.model';
import type { ITrack } from '../../core/models/track.model';

describe('media library state', () => {
  const track: ITrack = {
    id: 42,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.APPROVED,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/api/tracks/42/audio?token=signed',
    playsCount: 12,
    likesCount: 3,
    liked: true,
    own: false,
    createdAt: '2025-04-28T14:32:00Z',
    likedAt: '2025-05-01T09:00:00Z',
  };

  const pageOf = (items: ITrack[], page: number, totalElements: number): IPage<ITrack> => ({
    items: items,
    page: page,
    size: 10,
    totalElements: totalElements,
    hasNext: false,
  });

  let getLibrary: ReturnType<typeof vi.fn>;
  let setLiked: ReturnType<typeof vi.fn>;
  let writePageSize: ReturnType<typeof vi.fn>;
  let snackbar: Record<string, ReturnType<typeof vi.fn>>;

  const configure = (platform: string = 'browser'): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(mediaLibraryFeature),
        provideEffects(mediaLibraryEffects),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: TrackService, useValue: { getLibrary: getLibrary, setLiked: setLiked } },
        { provide: SnackbarService, useValue: snackbar },
        { provide: UploadsPreferencesService, useValue: { writePageSize: writePageSize } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getLibrary = vi.fn().mockReturnValue(of(pageOf([track], 0, 1)));
    setLiked = vi.fn().mockReturnValue(of(undefined));
    writePageSize = vi.fn();
    snackbar = { success: vi.fn(), error: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the latest additions first when the page opens', () => {
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    expect(getLibrary).toHaveBeenCalledWith({
      search: '',
      sort: 'ADDED',
      direction: 'DESC',
      page: 0,
      size: 10,
    });
    expect(store.selectSignal(mediaLibraryFeature.selectTracks)()).toEqual([track]);
  });

  it('opens with the remembered page size', () => {
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.opened({ pageSize: 50 }));

    expect(getLibrary).toHaveBeenCalledWith(expect.objectContaining({ size: 50 }));
  });

  it('searches the trimmed text only once typing pauses', () => {
    vi.useFakeTimers();
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.searchChanged({ search: 'ne' }));
    store.dispatch(MediaLibraryPageActions.searchChanged({ search: ' neon ' }));
    vi.advanceTimersByTime(300);

    expect(getLibrary).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ search: 'neon', page: 0 }),
    );
  });

  it('sorts a new column in its natural direction and flips it on the second click', () => {
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.sortSelected({ sort: LibrarySortEnum.TITLE }));
    store.dispatch(MediaLibraryPageActions.sortSelected({ sort: LibrarySortEnum.TITLE }));

    expect(getLibrary).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ sort: 'TITLE', direction: 'ASC' }),
    );
    expect(getLibrary).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ sort: 'TITLE', direction: 'DESC' }),
    );
  });

  it('remembers the chosen page size and reloads from the first page', () => {
    const store: Store = configure();
    store.dispatch(MediaLibraryPageActions.pageSelected({ page: 3 }));

    store.dispatch(MediaLibraryPageActions.pageSizeSelected({ size: 20 }));

    expect(writePageSize).toHaveBeenCalledExactlyOnceWith(20);
    expect(getLibrary).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, size: 20 }));
  });

  it.each([
    ['nothing was liked yet', '', LibraryEmptyStateEnum.EMPTY_LIBRARY],
    ['nothing matches the search', 'neon', LibraryEmptyStateEnum.NO_SEARCH_MATCH],
  ])(
    'explains an empty list when %s',
    (_: string, search: string, expected: LibraryEmptyStateEnum) => {
      getLibrary.mockReturnValue(of(pageOf([], 0, 0)));
      const store: Store = configure();

      store.dispatch(MediaLibraryPageActions.searchChanged({ search: search }));
      store.dispatch(MediaLibraryPageActions.retryClicked());

      expect(store.selectSignal(mediaLibraryFeature.selectEmptyState)()).toBe(expected);
    },
  );

  it('offers a retry when the library cannot be loaded', () => {
    getLibrary.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    expect(store.selectSignal(mediaLibraryFeature.selectEmptyState)()).toBe(
      LibraryEmptyStateEnum.LOAD_FAILED,
    );
  });

  it('queues every playable library track as likeable', () => {
    getLibrary.mockReturnValue(of(pageOf([track, { ...track, id: 7, audioUrl: null }], 0, 2)));
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    expect(store.selectSignal(mediaLibraryFeature.selectPlayerQueue)()).toEqual([
      {
        id: 42,
        title: 'Midnight Dreams',
        artistName: 'Neon Lights',
        coverUrl: null,
        audioUrl: '/api/tracks/42/audio?token=signed',
        liked: true,
        canLike: true,
      },
    ]);
  });

  it('takes the like back, tells the player and confirms the removal', () => {
    const store: Store = configure();
    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    store.dispatch(MediaLibraryPageActions.removeConfirmed({ trackId: 42 }));

    expect(setLiked).toHaveBeenCalledExactlyOnceWith(42, false);
    expect(snackbar['success']).toHaveBeenCalledExactlyOnceWith('messages.trackRemovedFromLibrary');
    expect(getLibrary).toHaveBeenCalledTimes(2);
  });

  it('reports a failed removal and keeps the list as it is', () => {
    setLiked.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure();
    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    store.dispatch(MediaLibraryPageActions.removeConfirmed({ trackId: 42 }));

    expect(snackbar['error']).toHaveBeenCalledExactlyOnceWith('messages.trackActionFailed');
    expect(getLibrary).toHaveBeenCalledOnce();
  });

  it('refreshes a loaded library when a like changes in the player', () => {
    const store: Store = configure();
    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    store.dispatch(PlayerApiActions.likeSaved({ trackId: 7, liked: true }));

    expect(getLibrary).toHaveBeenCalledTimes(2);
  });

  it('leaves a library that was never opened alone when a like changes', () => {
    configure();

    TestBed.inject(Store).dispatch(PlayerApiActions.likeSaved({ trackId: 7, liked: true }));

    expect(getLibrary).not.toHaveBeenCalled();
  });

  it('thanks the listener once a report was sent', () => {
    const store: Store = configure();

    store.dispatch(MediaLibraryPageActions.trackReported());

    expect(snackbar['success']).toHaveBeenCalledExactlyOnceWith('messages.trackReported');
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    expect(getLibrary).not.toHaveBeenCalled();
  });

  it('forgets the library when the layout closes', () => {
    const store: Store = configure();
    store.dispatch(MediaLibraryPageActions.opened({ pageSize: null }));

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(mediaLibraryFeature.selectTracks)()).toBeNull();
  });
});
