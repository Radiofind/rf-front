import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ProfilePageComponent } from './profile-page.component';
import { UserService } from '../../../../features/services/user-service/user.service';
import { AvatarStateService } from '../../../../features/services/avatar-state-service/avatar-state.service';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { AvatarModalComponent } from '../../../../features/dialogs/avatar-modal/avatar-modal.component';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';

import type { WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import type { IUserProfileData } from '../../../../core/models/user.model';
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
    additionalGenres: ['JAZZ'],
    registeredAt: '2026-01-15T10:00:00.000000',
    avatarUrl: null,
  };

  let getUserProfileData: ReturnType<typeof vi.fn>;
  let open: ReturnType<typeof vi.fn>;
  let modalClosed$: Subject<IAvatarModalResult | undefined>;
  let avatarUrl: WritableSignal<string | null>;
  let setAvatar: ReturnType<typeof vi.fn>;

  const createFixture = async (): Promise<ComponentFixture<ProfilePageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { getUserProfileData: getUserProfileData } },
        { provide: ModalService, useValue: { open: open } },
        {
          provide: AvatarStateService,
          useValue: { avatarUrl: avatarUrl.asReadonly(), setAvatar: setAvatar },
        },
      ],
    }).compileComponents();

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

  beforeEach(() => {
    TestBed.resetTestingModule();
    getUserProfileData = vi.fn().mockReturnValue(of(profileData));
    modalClosed$ = new Subject<IAvatarModalResult | undefined>();
    open = vi.fn().mockReturnValue({ closed: modalClosed$ });
    avatarUrl = signal<string | null>(null);
    setAvatar = vi.fn();
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

  it('requests the profile once on init', async () => {
    await createFixture();

    expect(getUserProfileData).toHaveBeenCalledTimes(1);
  });

  it('shows placeholders until the profile arrives', async () => {
    const profile$: Subject<IUserProfileData> = new Subject<IUserProfileData>();
    getUserProfileData = vi.fn().mockReturnValue(profile$);

    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__name')).toBe(Constants.DASH);
    expect(text(fixture, '.hero__meta span')).toBe('Artist');
    expect(text(fixture, '.stats__item:last-child .stats__value')).toBe(Constants.DASH);
    expect(detailValues(fixture)).toEqual([Constants.DASH, Constants.DASH]);

    profile$.next(profileData);
    profile$.complete();

    await vi.waitFor(() => {
      expect(text(fixture, '.hero__name')).toBe('Ada Lovelace');
    });
  });

  it('passes the formatted profile to the hero, stats and details', async () => {
    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__name')).toBe('Ada Lovelace');
    expect(text(fixture, '.hero__meta span')).toBe('Member of band');
    expect(text(fixture, '.hero__bio')).toBe('Engines in harmony');
    expect(text(fixture, '.stats__item:last-child .stats__value')).toBe('Jan 2026');
    expect(text(fixture, '.details__title')).toBe('About Band');
    expect(text(fixture, '.details__text')).toBe('Analytical soundscapes');
    expect(detailValues(fixture)).toEqual(['The Engines', 'Mar 7, 1994']);
  });

  it('falls back to artist wording and placeholders for missing optional fields', async () => {
    getUserProfileData = vi.fn().mockReturnValue(
      of({
        ...profileData,
        artistType: null,
        artistName: null,
        description: null,
        shortDescription: null,
      }),
    );

    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__meta span')).toBe('Artist');
    expect(text(fixture, '.hero__bio')).toBe(Constants.DASH);
    expect(text(fixture, '.details__title')).toBe('About Artist');
    expect(text(fixture, '.details__text')).toBe(Constants.DASH);
    expect(detailValues(fixture)[0]).toBe(Constants.DASH);
  });

  describe('main genres', () => {
    const heroMeta = (fixture: ComponentFixture<ProfilePageComponent>): string[] =>
      Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.hero__meta span'))
        .map((value: HTMLElement) => value.textContent.trim())
        .filter(Boolean);

    const createFixtureWithGenres = (
      genres: string[],
    ): Promise<ComponentFixture<ProfilePageComponent>> => {
      getUserProfileData = vi.fn().mockReturnValue(of({ ...profileData, mainGenres: genres }));
      return createFixture();
    };

    it('hides the genres until the profile arrives', async () => {
      getUserProfileData = vi.fn().mockReturnValue(new Subject<IUserProfileData>());

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

    it('replaces underscores with spaces and capitalizes every word', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixtureWithGenres([
        'HIP_HOP',
        'drum_and_bass',
      ]);

      expect(heroMeta(fixture)[1]).toBe('Hip Hop / Drum And Bass');
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

      avatarUrl.set('blob:avatar');
      await fixture.whenStable();

      expect(avatarSrc(fixture)).toBe('blob:avatar');
    });

    it('opens the avatar modal with the current avatar', async () => {
      avatarUrl.set('blob:avatar');
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

      expect(setAvatar).toHaveBeenCalledWith(uploaded);
    });

    it('shares the removal with the rest of the app', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);
      modalClosed$.next({ avatar: null });

      expect(setAvatar).toHaveBeenCalledWith(null);
    });

    it('keeps the avatar when the modal is dismissed', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);
      modalClosed$.next(undefined);

      expect(setAvatar).not.toHaveBeenCalled();
    });

    it('stops listening to the modal once the page is destroyed', async () => {
      const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

      await editAvatar(fixture);
      fixture.destroy();
      modalClosed$.next({ avatar: null });

      expect(setAvatar).not.toHaveBeenCalled();
    });
  });

  it('opens the edit page from the hero edit button', async () => {
    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.hero__edit')!.click();

    expect(navigate).toHaveBeenCalledWith([Links.EDIT_PROFILE_URL]);
  });
});
