import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MediaLibraryPageComponent } from './media-library-page.component';
import { UploadsPreferencesService } from '../../../features/services/uploads-preferences-service/uploads-preferences.service';
import { LibraryTrackActionsService } from '../../../features/services/library-track-actions-service/library-track-actions.service';
import { TrackStatusEnum } from '../../../core/enums/track-status.enum';
import { TrackActionEnum } from '../../../core/enums/track-action.enum';
import { LibraryEmptyStateEnum } from '../../../features/enums/library-empty-state.enum';
import { DEFAULT_GENERAL_SETTINGS } from '../../../features/constants/settings.constant';
import { MediaLibraryPageActions } from '../../../store/ui/media-library-page.actions';
import { mediaLibraryFeature } from '../../../store/media-library/media-library.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { ComponentFixture } from '@angular/core/testing';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { ITrack } from '../../../core/models/track.model';

describe('MediaLibraryPageComponent', () => {
  const midnight: ITrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.APPROVED,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/a/1',
    playsCount: 12,
    likesCount: 3,
    liked: true,
    own: false,
    createdAt: '2025-04-28T14:32:00Z',
    likedAt: '2025-05-01T09:00:00Z',
  };
  const space: ITrack = { ...midnight, id: 2, title: 'Lost in Space', audioUrl: '/a/2', own: true };
  const queue: IPlayerTrack[] = [
    {
      id: 1,
      title: 'Midnight Dreams',
      artistName: 'Neon Lights',
      coverUrl: null,
      audioUrl: '/a/1',
      liked: true,
      canLike: true,
    },
    {
      id: 2,
      title: 'Lost in Space',
      artistName: 'Neon Lights',
      coverUrl: null,
      audioUrl: '/a/2',
      liked: true,
      canLike: true,
    },
  ];

  let run: ReturnType<typeof vi.fn>;

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
    vi.restoreAllMocks();
  });

  const createFixture = async (state: {
    tracks: readonly ITrack[] | null;
    emptyState?: LibraryEmptyStateEnum | null;
    currentTrack?: IPlayerTrack | null;
  }): Promise<ComponentFixture<MediaLibraryPageComponent>> => {
    run = vi.fn();
    await TestBed.configureTestingModule({
      imports: [MediaLibraryPageComponent],
      providers: [
        { provide: UploadsPreferencesService, useValue: { readPageSize: () => 20 } },
        { provide: LibraryTrackActionsService, useValue: { run: run } },
        provideMockStore({
          selectors: [
            { selector: mediaLibraryFeature.selectTracks, value: state.tracks },
            { selector: mediaLibraryFeature.selectEmptyState, value: state.emptyState ?? null },
            { selector: mediaLibraryFeature.selectPlayerQueue, value: queue },
            { selector: mediaLibraryFeature.selectVisiblePages, value: [0] },
            { selector: mediaLibraryFeature.selectTotalPages, value: 1 },
            { selector: mediaLibraryFeature.selectPageSize, value: 10 },
            { selector: mediaLibraryFeature.selectSearch, value: '' },
            { selector: playerFeature.selectCurrentTrack, value: state.currentTrack ?? null },
            { selector: playerFeature.selectIsPlaying, value: state.currentTrack != null },
            {
              selector: settingsFeature.selectSettings,
              value: { ...DEFAULT_GENERAL_SETTINGS, radioMode: false },
            },
          ],
        }),
      ],
    }).compileComponents();

    const fixture: ComponentFixture<MediaLibraryPageComponent> =
      TestBed.createComponent(MediaLibraryPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<MediaLibraryPageComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const menuItems = async (
    fixture: ComponentFixture<MediaLibraryPageComponent>,
    title: string,
  ): Promise<string[]> => {
    element(fixture)
      .querySelector<HTMLButtonElement>(`button[aria-label='More actions for "${title}"']`)
      ?.click();
    await fixture.whenStable();

    return Array.from(document.querySelectorAll('.actions__item'), (item: Element) =>
      item.textContent.trim(),
    );
  };

  it('opens the library with the remembered page size', async () => {
    const dispatch = vi.spyOn(MockStore.prototype, 'dispatch');

    await createFixture({ tracks: null });

    expect(dispatch).toHaveBeenCalledWith(MediaLibraryPageActions.opened({ pageSize: 20 }));
  });

  it('shows liked tracks without a status column', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [midnight],
    });

    expect(element(fixture).querySelector('.tracks-table__head--status')).toBeNull();
    expect(element(fixture).querySelector('.tracks-table__title')?.textContent.trim()).toBe(
      'Midnight Dreams',
    );
  });

  it('offers details, a report and the removal for a track of another artist', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [midnight],
    });

    expect(await menuItems(fixture, 'Midnight Dreams')).toEqual([
      'Track Details',
      'Report Track',
      'Remove from Library',
    ]);
  });

  it('offers no report for an own track', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [space],
    });

    expect(await menuItems(fixture, 'Lost in Space')).toEqual([
      'Track Details',
      'Remove from Library',
    ]);
  });

  it('hands the chosen action over to the library actions', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [midnight],
    });
    await menuItems(fixture, 'Midnight Dreams');

    Array.from(document.querySelectorAll<HTMLButtonElement>('.actions__item'))
      .find((item: HTMLButtonElement) => item.textContent.trim() === 'Remove from Library')
      ?.click();

    expect(run).toHaveBeenCalledExactlyOnceWith(midnight, TrackActionEnum.REMOVE_FROM_LIBRARY);
  });

  it('starts playing the library from the clicked cover', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [midnight, space],
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    element(fixture)
      .querySelectorAll<HTMLButtonElement>('.tracks-table__cover--playable')[1]
      ?.click();

    expect(dispatch).toHaveBeenCalledWith(
      MediaLibraryPageActions.trackPlayed({ queue: queue, startIndex: 1 }),
    );
  });

  it('pauses instead of restarting when the playing track is clicked', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [midnight, space],
      currentTrack: queue[0],
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    element(fixture).querySelector<HTMLButtonElement>('.tracks-table__cover--playable')?.click();

    expect(dispatch).toHaveBeenCalledWith(MediaLibraryPageActions.playbackToggled());
  });

  it('hides the search while the library is empty', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [],
      emptyState: LibraryEmptyStateEnum.EMPTY_LIBRARY,
    });

    expect(element(fixture).querySelector('app-tracks-search')).toBeNull();
    expect(element(fixture).querySelector('.empty-library')).not.toBeNull();
  });

  it('clears the search from the empty search result', async () => {
    const fixture: ComponentFixture<MediaLibraryPageComponent> = await createFixture({
      tracks: [],
      emptyState: LibraryEmptyStateEnum.NO_SEARCH_MATCH,
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    element(fixture).querySelector<HTMLButtonElement>('.no-match__action')?.click();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(MediaLibraryPageActions.searchReset());
  });
});
