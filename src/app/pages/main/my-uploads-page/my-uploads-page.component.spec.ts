import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { MyUploadsPageComponent } from './my-uploads-page.component';
import { UploadsPreferencesService } from '../../../features/services/uploads-preferences-service/uploads-preferences.service';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';
import { Links } from '../../../core/constants/links';
import { TrackStatusEnum } from '../../../core/enums/track-status.enum';
import { UploadsEmptyStateEnum } from '../../../features/enums/uploads-empty-state.enum';
import { DEFAULT_GENERAL_SETTINGS } from '../../../features/constants/settings.constant';
import { MyUploadsPageActions } from '../../../store/ui/my-uploads-page.actions';
import { myUploadsFeature } from '../../../store/my-uploads/my-uploads.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { ComponentFixture } from '@angular/core/testing';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { ITrack } from '../../../core/models/track.model';

describe('MyUploadsPageComponent', () => {
  const midnight: ITrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.PENDING_REVIEW,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/api/tracks/1/audio?token=a',
    playsCount: 0,
    likesCount: 0,
    liked: false,
    own: true,
    likedAt: null,
    createdAt: '2025-04-28T14:32:00Z',
  };
  const space: ITrack = { ...midnight, id: 2, title: 'Lost in Space', audioUrl: '/a/2' };

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
    vi.restoreAllMocks();
  });
  const queue: IPlayerTrack[] = [
    {
      id: 1,
      title: 'Midnight Dreams',
      artistName: 'Neon Lights',
      coverUrl: null,
      audioUrl: '/a/1',
      liked: false,
      canLike: true,
    },
    {
      id: 2,
      title: 'Lost in Space',
      artistName: 'Neon Lights',
      coverUrl: null,
      audioUrl: '/a/2',
      liked: false,
      canLike: true,
    },
  ];

  const createFixture = async (state: {
    tracks: readonly ITrack[] | null;
    emptyState?: UploadsEmptyStateEnum | null;
    currentTrack?: IPlayerTrack | null;
    radioMode?: boolean;
  }): Promise<ComponentFixture<MyUploadsPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [MyUploadsPageComponent],
      providers: [
        provideRouter([]),
        { provide: UploadsPreferencesService, useValue: { readPageSize: () => 20 } },
        provideMockStore({
          selectors: [
            { selector: myUploadsFeature.selectTracks, value: state.tracks },
            { selector: myUploadsFeature.selectEmptyState, value: state.emptyState ?? null },
            { selector: myUploadsFeature.selectPlayerQueue, value: queue },
            { selector: myUploadsFeature.selectVisiblePages, value: [0] },
            { selector: myUploadsFeature.selectTotalPages, value: 1 },
            { selector: myUploadsFeature.selectPageSize, value: 10 },
            { selector: playerFeature.selectCurrentTrack, value: state.currentTrack ?? null },
            { selector: playerFeature.selectIsPlaying, value: state.currentTrack != null },
            {
              selector: settingsFeature.selectSettings,
              value: { ...DEFAULT_GENERAL_SETTINGS, radioMode: state.radioMode ?? false },
            },
          ],
        }),
      ],
    }).compileComponents();

    const fixture: ComponentFixture<MyUploadsPageComponent> =
      TestBed.createComponent(MyUploadsPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const covers = (fixture: ComponentFixture<MyUploadsPageComponent>): HTMLButtonElement[] =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.tracks-table__cover--playable',
      ),
    );

  it('starts playing the uploads from the clicked cover', async () => {
    const fixture: ComponentFixture<MyUploadsPageComponent> = await createFixture({
      tracks: [midnight, space],
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    covers(fixture)[1]?.click();

    expect(dispatch).toHaveBeenCalledWith(
      MyUploadsPageActions.trackPlayed({ queue: queue, startIndex: 1 }),
    );
  });

  it('pauses instead of restarting when the cover of the playing upload is clicked', async () => {
    const fixture: ComponentFixture<MyUploadsPageComponent> = await createFixture({
      tracks: [midnight, space],
      currentTrack: queue[0],
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    covers(fixture)[0]?.click();

    expect(dispatch).toHaveBeenCalledWith(MyUploadsPageActions.playbackToggled());
  });

  it('offers no playback on the covers while radio mode is on', async () => {
    const fixture: ComponentFixture<MyUploadsPageComponent> = await createFixture({
      tracks: [midnight, space],
      radioMode: true,
    });

    expect(covers(fixture)).toHaveLength(0);
  });

  it('leads an artist without uploads to the upload page', async () => {
    const fixture: ComponentFixture<MyUploadsPageComponent> = await createFixture({
      tracks: [],
      emptyState: UploadsEmptyStateEnum.NO_UPLOADS,
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.first-upload__cta')
      ?.click();

    expect(navigate).toHaveBeenCalledWith([Links.UPLOAD_TRACK_URL]);
  });
  it('asks for the page size chosen in the dropdown', async () => {
    const fixture: ComponentFixture<MyUploadsPageComponent> = await createFixture({
      tracks: [midnight, space],
    });
    const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');
    const select: SelectFieldComponent<string> = fixture.debugElement.query(
      By.directive(SelectFieldComponent),
    ).componentInstance as SelectFieldComponent<string>;

    select.onSelect('20');

    expect(dispatch).toHaveBeenCalledWith(MyUploadsPageActions.pageSizeSelected({ size: 20 }));
  });
  it('opens the list with the remembered page size', async () => {
    const dispatch = vi.spyOn(MockStore.prototype, 'dispatch');

    await createFixture({ tracks: null });

    expect(dispatch).toHaveBeenCalledWith(MyUploadsPageActions.opened({ pageSize: 20 }));
  });
});
