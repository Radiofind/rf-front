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
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { UploadsPreferencesService } from '../../features/services/uploads-preferences-service/uploads-preferences.service';
import { UploadsEmptyStateEnum } from '../../features/enums/uploads-empty-state.enum';
import { TrackStatusEnum } from '../../core/enums/track-status.enum';
import { OwnTracksSortEnum } from '../../core/enums/own-tracks-sort.enum';
import { PlayerApiActions } from '../player/player.actions';

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
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/api/tracks/42/audio?token=signed',
    playsCount: 0,
    likesCount: 0,
    liked: false,
    own: true,
    likedAt: null,
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
  let writePageSize: ReturnType<typeof vi.fn>;
  let trackActions: Record<string, ReturnType<typeof vi.fn>>;
  let snackbar: Record<string, ReturnType<typeof vi.fn>>;

  const configure = (platform: string = 'browser'): Store => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(myUploadsFeature),
        provideEffects(myUploadsEffects),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: TrackService, useValue: { getOwnTracks: getOwnTracks, ...trackActions } },
        { provide: SnackbarService, useValue: snackbar },
        { provide: UploadsPreferencesService, useValue: { writePageSize: writePageSize } },
      ],
    });
    return TestBed.inject<Store>(Store);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getOwnTracks = vi.fn().mockReturnValue(of(pageOf([track], 0, 1)));
    writePageSize = vi.fn();
    trackActions = {
      cancelSubmission: vi.fn().mockReturnValue(of(undefined)),
      submitForReview: vi.fn().mockReturnValue(of(undefined)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    snackbar = { success: vi.fn(), error: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the first page of all own uploads when the page opens', () => {
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    expect(getOwnTracks).toHaveBeenCalledWith({
      status: null,
      search: '',
      sort: 'UPLOADED',
      direction: 'DESC',
      page: 0,
      size: 10,
    });
    expect(store.selectSignal(myUploadsFeature.selectTracks)()).toEqual([track]);
  });

  it('reloads from the first page when a status tab is selected', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.pageSelected({ page: 2 }));

    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.REJECTED }));

    expect(getOwnTracks).toHaveBeenLastCalledWith({
      status: TrackStatusEnum.REJECTED,
      search: '',
      sort: 'UPLOADED',
      direction: 'DESC',
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
    expect(getOwnTracks).toHaveBeenCalledWith({
      status: null,
      search: 'neon',
      sort: 'UPLOADED',
      direction: 'DESC',
      page: 0,
      size: 10,
    });
  });

  it('invites to upload a first track when the account has no uploads', () => {
    getOwnTracks.mockReturnValue(of(pageOf([], 0, 0)));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

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
    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    store.dispatch(MyUploadsPageActions.retryClicked());

    expect(getOwnTracks).toHaveBeenCalledTimes(2);
    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBeNull();
  });

  it('keeps the failure visible until the retry', () => {
    getOwnTracks.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    expect(store.selectSignal(myUploadsFeature.selectEmptyState)()).toBe(
      UploadsEmptyStateEnum.LOAD_FAILED,
    );
  });

  it('clears search and status when the filters are reset', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.REJECTED }));

    store.dispatch(MyUploadsPageActions.filtersReset());

    expect(getOwnTracks).toHaveBeenLastCalledWith({
      status: null,
      search: '',
      sort: 'UPLOADED',
      direction: 'DESC',
      page: 0,
      size: 10,
    });
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

    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    expect(getOwnTracks).not.toHaveBeenCalled();
  });

  it('forgets the uploads and filters when the layout closes', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.statusSelected({ status: TrackStatusEnum.REJECTED }));

    store.dispatch(MainLayoutActions.closed());

    expect(store.selectSignal(myUploadsFeature.selectTracks)()).toBeNull();
    expect(store.selectSignal(myUploadsFeature.selectStatus)()).toBeNull();
  });
  it.each([
    [OwnTracksSortEnum.TITLE, 'ASC'],
    [OwnTracksSortEnum.PLAYS, 'DESC'],
    [OwnTracksSortEnum.LIKES, 'DESC'],
  ])(
    'sorts by %s starting %s from the first page',
    (sort: OwnTracksSortEnum, direction: string) => {
      const store: Store = configure();
      store.dispatch(MyUploadsPageActions.pageSelected({ page: 2 }));

      store.dispatch(MyUploadsPageActions.sortSelected({ sort: sort }));

      expect(getOwnTracks).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: sort, direction: direction, page: 0 }),
      );
    },
  );

  it('reverses the order when the sorted column is chosen again', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.sortSelected({ sort: OwnTracksSortEnum.DURATION }));

    store.dispatch(MyUploadsPageActions.sortSelected({ sort: OwnTracksSortEnum.DURATION }));

    expect(getOwnTracks).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: OwnTracksSortEnum.DURATION, direction: 'ASC' }),
    );
  });

  it('counts a like saved in the player for the listed upload', () => {
    getOwnTracks.mockReturnValue(of(pageOf([{ ...track, likesCount: 4 }], 0, 1)));
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    store.dispatch(PlayerApiActions.likeSaved({ trackId: 42, liked: true }));

    expect(store.selectSignal(myUploadsFeature.selectTracks)()?.[0]).toMatchObject({
      liked: true,
      likesCount: 5,
    });
  });

  it('hands the like state of the uploads to the player queue', () => {
    getOwnTracks.mockReturnValue(of(pageOf([{ ...track, liked: true }], 0, 1)));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    expect(store.selectSignal(myUploadsFeature.selectPlayerQueue)()[0]?.liked).toBe(true);
  });
  it('shows the chosen number of uploads per page starting from the first page', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.pageSelected({ page: 2 }));

    store.dispatch(MyUploadsPageActions.pageSizeSelected({ size: 20 }));

    expect(getOwnTracks).toHaveBeenLastCalledWith(expect.objectContaining({ size: 20, page: 0 }));
  });

  it('counts the shown range with the chosen page size', () => {
    getOwnTracks.mockReturnValue(of(pageOf([track], 1, 21)));
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.pageSizeSelected({ size: 20 }));

    store.dispatch(MyUploadsPageActions.pageSelected({ page: 1 }));

    expect(store.selectSignal(myUploadsFeature.selectRangeStart)()).toBe(21);
    expect(store.selectSignal(myUploadsFeature.selectRangeEnd)()).toBe(21);
    expect(store.selectSignal(myUploadsFeature.selectTotalPages)()).toBe(2);
  });
  it('opens with the page size remembered from an earlier visit', () => {
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened({ pageSize: 50 }));

    expect(getOwnTracks).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ size: 50 }));
  });

  it('remembers the chosen page size for the next visit', () => {
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.pageSizeSelected({ size: 20 }));

    expect(writePageSize).toHaveBeenCalledExactlyOnceWith(20);
  });
  it('lets the player like only uploads that passed the review', () => {
    getOwnTracks.mockReturnValue(
      of(pageOf([track, { ...track, id: 43, status: TrackStatusEnum.APPROVED }], 0, 2)),
    );
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    expect(
      store
        .selectSignal(myUploadsFeature.selectPlayerQueue)()
        .map((queued) => queued.canLike),
    ).toEqual([false, true]);
  });
  it('withdraws a submission, confirms it and shows the uploads again', () => {
    const store: Store = configure();
    store.dispatch(MyUploadsPageActions.opened({ pageSize: null }));

    store.dispatch(MyUploadsPageActions.submissionCancelConfirmed({ trackId: 42 }));

    expect(trackActions['cancelSubmission']).toHaveBeenCalledExactlyOnceWith(42);
    expect(getOwnTracks).toHaveBeenCalledTimes(2);
    expect(snackbar['success']).toHaveBeenCalledExactlyOnceWith('messages.submissionCancelled');
  });

  it.each([
    [false, 'messages.trackSubmitted'],
    [true, 'messages.trackResubmitted'],
  ])(
    'confirms a submission for review (resubmission %s) with %s',
    (isResubmission: boolean, message: string) => {
      const store: Store = configure();

      store.dispatch(
        MyUploadsPageActions.submitConfirmed({ trackId: 42, isResubmission: isResubmission }),
      );

      expect(trackActions['submitForReview']).toHaveBeenCalledExactlyOnceWith(42);
      expect(snackbar['success']).toHaveBeenCalledExactlyOnceWith(message);
    },
  );

  it('removes a deleted track from the list', () => {
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.deleteConfirmed({ trackId: 42 }));

    expect(trackActions['delete']).toHaveBeenCalledExactlyOnceWith(42);
    expect(getOwnTracks).toHaveBeenCalledOnce();
    expect(snackbar['success']).toHaveBeenCalledExactlyOnceWith('messages.trackDeleted');
  });

  it('tells the user when a track action fails and keeps the list as it is', () => {
    trackActions['delete']?.mockReturnValue(throwError(() => new Error('offline')));
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.deleteConfirmed({ trackId: 42 }));

    expect(snackbar['error']).toHaveBeenCalledExactlyOnceWith('messages.trackActionFailed');
    expect(getOwnTracks).not.toHaveBeenCalled();
  });

  it('shows the uploads again after the details were edited', () => {
    const store: Store = configure();

    store.dispatch(MyUploadsPageActions.trackEdited());

    expect(getOwnTracks).toHaveBeenCalledOnce();
    expect(snackbar['success']).toHaveBeenCalledExactlyOnceWith('messages.trackUpdated');
  });
});
