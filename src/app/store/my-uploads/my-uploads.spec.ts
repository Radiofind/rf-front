import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { myUploadsFeature } from './my-uploads.feature';
import * as myUploadsEffects from './my-uploads.effects';
import { MyUploadsPageActions } from '../ui/my-uploads-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { TrackService } from '../../features/services/track-service/track.service';
import { UploadsEmptyStateEnum } from '../../features/enums/uploads-empty-state.enum';
import { TrackStatusEnum } from '../../core/enums/track-status.enum';

import type { IPage } from '../../core/models/page.model';
import type { ITrack } from '../../core/models/track.model';

describe('my uploads state', () => {
  const track: ITrack = {
    id: 42,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.PENDING_REVIEW,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    coverUrl: null,
    audioUrl: '/api/tracks/42/audio?token=signed',
    createdAt: '2025-04-28T14:32:00Z',
  };

  const pageOf = (items: ITrack[], page: number, totalElements: number): IPage<ITrack> => ({
    items: items,
    page: page,
    size: 10,
    totalElements: totalElements,
    hasNext: false,
  });

  let getOwnTracks: ReturnType<typeof vi.fn>;

  const configure = (platform: string = 'browser'): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(myUploadsFeature),
        provideEffects(myUploadsEffects),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: TrackService, useValue: { getOwnTracks: getOwnTracks } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getOwnTracks = vi.fn().mockReturnValue(of(pageOf([track], 0, 1)));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the first page of all own uploads when the page opens', () => {
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened());

    expect(getOwnTracks).toHaveBeenCalledWith({ status: null, search: '', page: 0, size: 10 });
    expect(store.selectSignal(myUploadsFeature.selectTracks)()).toEqual([track]);
  });

  it('reloads from the first page when a status tab is selected', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.pageSelected({ page: 2 }));

    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.REJECTED }));

    expect(getOwnTracks).toHaveBeenLastCalledWith({
      status: TrackStatusEnum.REJECTED,
      search: '',
      page: 0,
      size: 10,
    });
  });

  it('searches the trimmed text only once typing pauses', () => {
    vi.useFakeTimers();
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.searchChanged({ search: 'ne' }));
    store.dispatch(MyUploadsPageActions.searchChanged({ search: ' neon ' }));
    vi.advanceTimersByTime(300);

    expect(getOwnTracks).toHaveBeenCalledOnce();
    expect(getOwnTracks).toHaveBeenCalledWith({ status: null, search: 'neon', page: 0, size: 10 });
  });

  it('invites to upload a first track when the account has no uploads', () => {
    getOwnTracks.mockReturnValue(of(pageOf([], 0, 0)));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened());

    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBe(
      UploadsEmptyStateEnum.NO_UPLOADS,
    );
  });

  it('explains an empty status tab separately from an empty account', () => {
    getOwnTracks.mockReturnValue(of(pageOf([], 0, 0)));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.APPROVED }));

    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBe(
      UploadsEmptyStateEnum.NO_STATUS_MATCH,
    );
  });

  it('reports a search without matches even inside a status tab', () => {
    vi.useFakeTimers();
    getOwnTracks.mockReturnValue(of(pageOf([], 0, 0)));
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.APPROVED }));

    store.dispatch(MyUploadsPageActions.searchChanged({ search: 'zzz' }));
    vi.advanceTimersByTime(300);

    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBe(
      UploadsEmptyStateEnum.NO_SEARCH_MATCH,
    );
  });

  it('shows the failure and loads again on retry', () => {
    getOwnTracks.mockReturnValueOnce(throwError(() => new Error('offline')));
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.opened());

    store.dispatch(MyUploadsPageActions.retryClicked());

    expect(getOwnTracks).toHaveBeenCalledTimes(2);
    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBeNull();
  });

  it('keeps the failure visible until the retry', () => {
    getOwnTracks.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened());

    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBe(
      UploadsEmptyStateEnum.LOAD_FAILED,
    );
  });

  it('clears search and status when the filters are reset', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.REJECTED }));

    store.dispatch(MyUploadsPageActions.filtersReset());

    expect(getOwnTracks).toHaveBeenLastCalledWith({ status: null, search: '', page: 0, size: 10 });
  });

  it('describes which uploads of the total are shown on the current page', () => {
    getOwnTracks.mockReturnValue(of(pageOf([track, { ...track, id: 43 }], 1, 12)));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.pageSelected({ page: 1 }));

    expect(store.selectSignal(myUploadsFeature.selectRangeStart)()).toBe(11);
    expect(store.selectSignal(myUploadsFeature.selectRangeEnd)()).toBe(12);
    expect(store.selectSignal(myUploadsFeature.selectTotalPages)()).toBe(2);
  });

  it('does not load during server rendering', () => {
    const store: Store = configure('server');

    store.dispatch(MyUploadsPageActions.opened());

    expect(getOwnTracks).not.toHaveBeenCalled();
  });

  it('forgets the uploads and filters when the layout closes', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.REJECTED }));

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(myUploadsFeature.selectTracks)()).toBeNull();
    expect(store.selectSignal(myUploadsFeature.selectStatus)()).toBeNull();
  });
});
