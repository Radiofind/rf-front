import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ProfilePageComponent } from './profile-page.component';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { AvatarModalComponent } from '../../../../features/dialogs/avatar-modal/avatar-modal.component';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';
import { ProfilePageActions } from '../../../../store/ui/profile-page.actions';
import { profileFeature } from '../../../../store/profile/profile.feature';
import { avatarFeature } from '../../../../store/avatar/avatar.feature';

import type { ComponentFixture } from '@angular/core/testing';
import type { IUserProfileData } from '../../../../core/models/user.model';
import type { IActivity } from '../../../../core/models/activity.model';
import type { IAvatarModalResult } from '../../../../features/models/avatar-modal.model';

describe('ProfilePageComponent', () => {
  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: null,
    dateOfBirth: '1994-03-07',
    artistType: 'BAND',
    artistName: 'The Engines',
    description: 'Analytical soundscapes',
    shortDescription: 'Engines in harmony',
    socialLinks: {
      telegram: null,
      instagram: null,
      youtube: null,
      facebook: null,
      spotify: null,
      appleMusic: null,
      soundcloud: null,
      bandcamp: null,
      icloud: null,
      tiktok: null,
    },
    mainGenres: ['ELECTRONIC'],
    additionalGenres: ['ACID_JAZZ'],
    registeredAt: '2026-01-15T10:00:00.000000',
    uploadsCount: 2,
    avatarUrl: null,
  };

  let profile: IUserProfileData | null;
  let activities: readonly IActivity[] | null;
  let avatarUrl: string | null;
  let open: ReturnType<typeof vi.fn>;
  let modalClosed$: Subject<IAvatarModalResult | undefined>;
  let dispatch: ReturnType<typeof vi.spyOn>;

  const createFixture = async (): Promise<ComponentFixture<ProfilePageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        provideRouter([]),
        { provide: ModalService, useValue: { open: open } },
        provideMockStore({
          selectors: [
            { selector: profileFeature.selectProfile, value: profile },
            { selector: profileFeature.selectActivities, value: activities },
            { selector: avatarFeature.selectUrl, value: avatarUrl },
          ],
        }),
      ],
    }).compileComponents();

    dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');
    const fixture: ComponentFixture<ProfilePageComponent> =
      TestBed.createComponent(ProfilePageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const text = (fixture: ComponentFixture<ProfilePageComponent>, selector: string): string =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)!.textContent.trim();

  const detailValues = (fixture: ComponentFixture<ProfilePageComponent>): string[] =>
    Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.details__field:not(.details__field--full) dd'),
    ).map((value: HTMLElement) => value.textContent.trim());

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    profile = profileData;
    activities = [];
    avatarUrl = null;
    modalClosed$ = new Subject<IAvatarModalResult | undefined>();
    open = vi.fn().mockReturnValue({ closed: modalClosed$ });
  });

  const avatarSrc = (fixture: ComponentFixture<ProfilePageComponent>): string | null =>
    (fixture.nativeElement as HTMLElement)
      .querySelector('.hero__avatar-photo')
      ?.getAttribute('src') ?? null;

  const editAvatar = async (fixture: ComponentFixture<ProfilePageComponent>): Promise<void> => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.hero__avatar-edit')!
      .click();
    await fixture.whenStable();
  };

  it('reports the page as opened on init', async () => {
    await createFixture();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(ProfilePageActions.opened());
  });

  it('shows placeholders until the profile arrives', async () => {
    profile = null;

    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__name')).toBe(Constants.DASH);
    expect(text(fixture, '.hero__meta span')).toBe('Artist');
    expect(text(fixture, '.stats__item:last-child .stats__value')).toBe(Constants.DASH);
    expect(text(fixture, '.stats__item:nth-child(2) .stats__value')).toBe(Constants.DASH);
    expect(detailValues(fixture)).toEqual([Constants.DASH, Constants.DASH]);
  });

  it('passes the formatted profile to the hero, stats and details', async () => {
    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__name')).toBe('Ada Lovelace');
    expect(text(fixture, '.hero__meta span')).toBe('Member of band');
    expect(text(fixture, '.hero__bio')).toBe('Engines in harmony');
    expect(text(fixture, '.stats__item:last-child .stats__value')).toBe('Jan 2026');
    expect(text(fixture, '.stats__item:nth-child(2) .stats__value')).toBe('2');
    expect(text(fixture, '.details__title')).toBe('About Band');
    expect(text(fixture, '.details__text')).toBe('Analytical soundscapes');
    expect(detailValues(fixture)).toEqual(['The Engines', 'Mar 7, 1994']);
  });

  it('falls back to artist wording and placeholders for missing optional fields', async () => {
    profile = {
      ...profileData,
      artistType: null,
      artistName: null,
      description: null,
      shortDescription: null,
    };

    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__meta span')).toBe('Artist');
    expect(text(fixture, '.hero__bio')).toBe(Constants.DASH);
    expect(text(fixture, '.details__title')).toBe('About Artist');
    expect(text(fixture, '.details__text')).toBe(Constants.DASH);
    expect(detailValues(fixture)[0]).toBe(Constants.DASH);
  });

  describe('social links', () => {
    const socialLabels = (fixture: ComponentFixture<ProfilePageComponent>): (string | null)[] =>
      Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.hero__social')).map(
        (link: HTMLElement) => link.getAttribute('aria-label'),
      );

    it('shows the saved social links in the hero', async () => {
      profile = {
        ...profileData,
        socialLinks: { ...profileData.socialLinks!, youtube: 'https://youtube.com/@engines' },
      };

      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(socialLabels(fixture)).toEqual(['YouTube']);
    });

    it('shows no social links when none are saved', async () => {
      profile = { ...profileData, socialLinks: null };

      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(fixture.nativeElement.querySelector('.hero__socials')).toBeNull();
    });
  });

  describe('additional genres', () => {
    const genresValue = (fixture: ComponentFixture<ProfilePageComponent>): string =>
      text(fixture, '.details__field--full dd');

    it('passes the additional genres to the details as chips', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(
        Array.from<HTMLElement>(
          fixture.nativeElement.querySelectorAll('.details__field--full .chips-field__chip'),
        ).map((chip: HTMLElement) => chip.textContent.trim()),
      ).toEqual(['Acid Jazz']);
    });

    it('shows a dash when the profile has no additional genres', async () => {
      profile = { ...profileData, additionalGenres: [] };

      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(genresValue(fixture)).toBe(Constants.DASH);
    });
  });

  describe('main genres', () => {
    const heroMeta = (fixture: ComponentFixture<ProfilePageComponent>): string[] =>
      Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.hero__meta span'))
        .map((value: HTMLElement) => value.textContent.trim())
        .filter(Boolean);

    const createFixtureWithGenres = (
      genres: string[],
    ): Promise<ComponentFixture<ProfilePageComponent>> => {
      profile = { ...profileData, mainGenres: genres };
      return createFixture();
    };

    it('hides the genres until the profile arrives', async () => {
      profile = null;

      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(heroMeta(fixture)).toEqual(['Artist']);
      expect(fixture.nativeElement.querySelector('.hero__meta-dot')).toBeNull();
    });

    it('hides the genres when the profile has none', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixtureWithGenres([]);

      expect(heroMeta(fixture)).toEqual(['Member of band']);
      expect(fixture.nativeElement.querySelector('.hero__meta-dot')).toBeNull();
    });

    it('capitalizes a single-word genre', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixtureWithGenres([
        'ELECTRONIC',
      ]);

      expect(heroMeta(fixture)).toEqual(['Member of band', 'Electronic']);
      expect(fixture.nativeElement.querySelector('.hero__meta-dot')).not.toBeNull();
    });

    it('shows the translated label of a known genre', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixtureWithGenres([
        'LO_FI_HIP_HOP',
        'TRAP_EDM',
      ]);

      expect(heroMeta(fixture)[1]).toBe('Lo-Fi Hip-Hop / Trap (EDM)');
    });

    it('capitalizes every word of an unknown genre', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixtureWithGenres([
        'NEO_CLASSICAL',
        'dark_wave',
      ]);

      expect(heroMeta(fixture)[1]).toBe('Neo Classical / Dark Wave');
    });

    it('joins several genres with a slash', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixtureWithGenres([
        'ROCK',
        'pop',
        'JAZZ',
      ]);

      expect(heroMeta(fixture)[1]).toBe('Rock / Pop / Jazz');
    });
  });

  describe('avatar', () => {
    it('shows the shared avatar and follows its updates', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(avatarSrc(fixture)).toBeNull();

      TestBed.inject(MockStore).overrideSelector(avatarFeature.selectUrl, 'blob:avatar');
      TestBed.inject(MockStore).refreshState();
      await fixture.whenStable();

      expect(avatarSrc(fixture)).toBe('blob:avatar');
    });

    it('opens the avatar modal with the current avatar', async () => {
      avatarUrl = 'blob:avatar';
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);

      expect(open).toHaveBeenCalledWith(
        AvatarModalComponent,
        expect.objectContaining({ data: { avatarUrl: 'blob:avatar' } }),
      );
    });

    it('shares the uploaded avatar with the rest of the app', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();
      const uploaded: File = new File(['new'], 'new.png', { type: 'image/png' });

      await editAvatar(fixture);
      modalClosed$.next({ avatar: uploaded });

      expect(dispatch).toHaveBeenLastCalledWith(
        ProfilePageActions.avatarChanged({ avatar: uploaded }),
      );
    });

    it('shares the removal with the rest of the app', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);
      modalClosed$.next({ avatar: null });

      expect(dispatch).toHaveBeenLastCalledWith(ProfilePageActions.avatarChanged({ avatar: null }));
    });

    it('keeps the avatar when the modal is dismissed', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);
      modalClosed$.next(undefined);

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: ProfilePageActions.avatarChanged.type }),
      );
    });

    it('stops listening to the modal once the page is destroyed', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);
      fixture.destroy();
      modalClosed$.next({ avatar: null });

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: ProfilePageActions.avatarChanged.type }),
      );
    });
  });

  it('opens the edit page from the hero edit button', async () => {
    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.hero__edit')!.click();

    expect(navigate).toHaveBeenCalledWith([Links.EDIT_PROFILE_URL]);
  });

  describe('latest activity', () => {
    const activity: IActivity = {
      id: 3,
      type: 'TRACK_UPLOADED',
      createdAt: '2026-11-05T10:00:00Z',
      track: {
        id: 42,
        title: 'Midnight Dreams',
        artistName: 'The Engines',
        coverUrl: null,
        status: 'PENDING_REVIEW',
      },
    };

    it('lists the loaded activities', async () => {
      activities = [activity];
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect(text(fixture, '.activity__name')).toBe('Midnight Dreams');
    });

    it('shows neither activities nor the empty state while they are unknown', async () => {
      activities = null;
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      expect((fixture.nativeElement as HTMLElement).querySelector('.activity__list')).toBeNull();
      expect((fixture.nativeElement as HTMLElement).querySelector('.activity__empty')).toBeNull();
    });
  });
});
