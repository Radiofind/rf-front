import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { UserProfilePageComponent } from './user-profile-page.component';
import { PublicProfilePageActions } from '../../../store/ui/public-profile-page.actions';
import { publicProfileFeature } from '../../../store/public-profile/public-profile.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';
import { PublicProfileStatusEnum } from '../../../core/enums/public-profile-status.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { ParamMap } from '@angular/router';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { IPublicProfile } from '../../../core/models/public-profile.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';
import type { ITrack } from '../../../core/models/track.model';

describe('UserProfilePageComponent', () => {
  const publicId: string = '6f1c2b4e-3d5a-4c8e-9b7f-1a2b3c4d5e6f';

  const visible: IPublicProfile = {
    publicId: publicId,
    displayName: 'Nova',
    avatarUrl: null,
    access: 'FULL',
    own: false,
    following: false,
    canFollow: true,
    details: {
      artistType: 'BAND',
      mainGenres: [],
      additionalGenres: [],
      shortDescription: 'Analytical soundscapes',
      description: null,
      socialLinks: null,
      followersCount: 4,
      tracksCount: 2,
      likesCount: 9,
      joinedAt: '2025-03',
    },
  };

  const midnight = { id: 1, title: 'Midnight Dreams', audioUrl: '/a/1' } as ITrack;

  const queue: IPlayerTrack[] = [
    {
      id: 1,
      title: 'Midnight Dreams',
      artistName: 'Nova',
      coverUrl: null,
      audioUrl: '/a/1',
      liked: false,
      canLike: true,
    },
  ];

  let params$: BehaviorSubject<ParamMap>;
  let dispatch: ReturnType<typeof vi.spyOn>;

  const createFixture = async (state: {
    status?: PublicProfileStatusEnum;
    profile?: IPublicProfile | null;
  }): Promise<ComponentFixture<UserProfilePageComponent>> => {
    params$ = new BehaviorSubject<ParamMap>(convertToParamMap({ publicId: publicId }));

    await TestBed.configureTestingModule({
      imports: [UserProfilePageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params$ } },
        provideMockStore({
          selectors: [
            {
              selector: publicProfileFeature.selectStatus,
              value: state.status ?? PublicProfileStatusEnum.LOADED,
            },
            { selector: publicProfileFeature.selectProfile, value: state.profile ?? null },
            { selector: publicProfileFeature.selectAvatarUrl, value: null },
            { selector: publicProfileFeature.selectTracks, value: [midnight] },
            { selector: publicProfileFeature.selectPlayerQueue, value: queue },
            { selector: publicProfileFeature.selectHasMoreTracks, value: false },
            { selector: publicProfileFeature.selectIsLoadingTracks, value: false },
            { selector: publicProfileFeature.selectIsFollowPending, value: false },
            { selector: playerFeature.selectCurrentTrack, value: null },
            { selector: playerFeature.selectIsPlaying, value: false },
            {
              selector: settingsFeature.selectSettings,
              value: { radioMode: false } as IGeneralSettings,
            },
          ],
        }),
      ],
    }).compileComponents();

    dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');
    const fixture: ComponentFixture<UserProfilePageComponent> =
      TestBed.createComponent(UserProfilePageComponent);
    await fixture.whenStable();
    return fixture;
  };

  const element = (fixture: ComponentFixture<UserProfilePageComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
    vi.restoreAllMocks();
  });

  it('opens the profile named in the address', async () => {
    await createFixture({});

    expect(dispatch).toHaveBeenCalledWith(PublicProfilePageActions.opened({ publicId: publicId }));
  });

  it('opens the next profile when the address changes on the same page', async () => {
    await createFixture({});

    params$.next(convertToParamMap({ publicId: 'a0b1c2d3-0000-4000-8000-000000000000' }));

    expect(dispatch).toHaveBeenCalledWith(
      PublicProfilePageActions.opened({ publicId: 'a0b1c2d3-0000-4000-8000-000000000000' }),
    );
  });

  it('lets go of the profile when the page is left', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({});

    fixture.destroy();

    expect(dispatch).toHaveBeenCalledWith(PublicProfilePageActions.left());
  });

  it('says when the profile does not exist', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      status: PublicProfileStatusEnum.NOT_FOUND,
    });

    expect(element(fixture).querySelector('.empty__title')!.textContent.trim()).toBe(
      'Profile not found',
    );
  });

  it('says the account was deleted and leads back to the media library', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      status: PublicProfileStatusEnum.DELETED,
    });

    expect(element(fixture).querySelector('.empty__title')!.textContent.trim()).toBe(
      'This account was deleted',
    );
    expect(element(fixture).querySelector('a.profile__action')!.getAttribute('href')).toBe(
      '/media-library',
    );
  });

  it('retries a profile that failed to load', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      status: PublicProfileStatusEnum.FAILED,
    });

    element(fixture).querySelector<HTMLButtonElement>('.profile__retry')!.click();

    expect(dispatch).toHaveBeenCalledWith(PublicProfilePageActions.retryClicked());
  });

  it('shows the published counters and never a date of birth', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      profile: visible,
    });

    const values: string[] = Array.from(
      element(fixture).querySelectorAll('.stats__value'),
      (value: Element) => value.textContent.trim(),
    );

    expect(values).toEqual(['4', '2', '9', 'Mar 2025']);
    expect(element(fixture).textContent).not.toContain('Date of Birth');
  });

  it('shows only the name and an explanation of a restricted profile', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      profile: { ...visible, access: 'RESTRICTED', details: null },
    });

    expect(element(fixture).querySelector('.hero__name')!.textContent.trim()).toBe('Nova');
    expect(element(fixture).querySelector('app-profile-stats')).toBeNull();
    expect(element(fixture).querySelector('app-profile-restricted')).not.toBeNull();
  });

  it('follows the artist from the hero', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      profile: visible,
    });

    element(fixture).querySelector<HTMLButtonElement>('.follow')!.click();

    expect(dispatch).toHaveBeenCalledWith(PublicProfilePageActions.followClicked());
  });

  it('offers no following where the profile does not allow it', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      profile: { ...visible, access: 'HIDDEN', details: null, canFollow: false },
    });

    expect(element(fixture).querySelector('.follow')).toBeNull();
  });

  it('plays the artist tracks from the clicked one', async () => {
    const fixture: ComponentFixture<UserProfilePageComponent> = await createFixture({
      profile: visible,
    });

    element(fixture).querySelector<HTMLButtonElement>('.tracks__play')!.click();

    expect(dispatch).toHaveBeenCalledWith(
      PublicProfilePageActions.trackPlayed({ queue: queue, startIndex: 0 }),
    );
  });
});
