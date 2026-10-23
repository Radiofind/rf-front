import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditProfilePageComponent } from './edit-profile-page.component';
import { UserService } from '../../../../features/services/user-service/user.service';
import { AuthService } from '../../../../features/services/auth-service/auth.service';
import { SnackbarService } from '../../../../shared/services/snackbar-service/snackbar.service';
import { ProfileValidationMessages } from '../../../../features/constants/profile-error-messages.constant';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';

import type { ComponentFixture } from '@angular/core/testing';
import type {
  ISocialLinksData,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserProfileData,
} from '../../../../core/models/user.model';

describe('EditProfilePageComponent', () => {
  const noSocialLinks: ISocialLinksData = {
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
  };

  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: 'backup@example.com',
    dateOfBirth: '1994-03-07',
    artistType: 'BAND',
    artistName: 'The Engines',
    description: 'Analytical soundscapes',
    shortDescription: 'Engines in harmony',
    socialLinks: { ...noSocialLinks, telegram: 'https://t.me/engines' },
    mainGenres: ['ELECTRONIC', 'AMBIENT'],
    additionalGenres: ['JAZZ'],
    registeredAt: '2026-01-15T10:00:00.000000',
    avatarUrl: null,
  };

  const emptyProfile: IUserProfileData = {
    ...profileData,
    recoveryEmail: null,
    artistType: null,
    artistName: null,
    description: null,
    shortDescription: null,
    socialLinks: null,
    mainGenres: [],
    additionalGenres: [],
  };

  const updatedProfile = (requiresReauthentication: boolean = false): IUpdatedProfileData => ({
    profile: profileData,
    emailChanged: requiresReauthentication,
    requiresReauthentication: requiresReauthentication,
  });

  let getUserProfileData: ReturnType<typeof vi.fn>;
  let updateUserProfileData: ReturnType<typeof vi.fn>;
  let logout: ReturnType<typeof vi.fn>;
  let snackbar: Record<'success' | 'error' | 'info', ReturnType<typeof vi.fn>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  const createFixture = async (): Promise<ComponentFixture<EditProfilePageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [EditProfilePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            getUserProfileData: getUserProfileData,
            updateUserProfileData: updateUserProfileData,
          },
        },
        { provide: AuthService, useValue: { logout: logout } },
        { provide: SnackbarService, useValue: snackbar },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const fixture: ComponentFixture<EditProfilePageComponent> =
      TestBed.createComponent(EditProfilePageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<EditProfilePageComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const control = (
    fixture: ComponentFixture<EditProfilePageComponent>,
    label: string,
  ): HTMLInputElement | HTMLTextAreaElement =>
    Array.from(element(fixture).querySelectorAll('app-input-field'))
      .find((field) => field.querySelector('.label')!.textContent.trim().startsWith(label))!
      .querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')!;

  const type = async (
    fixture: ComponentFixture<EditProfilePageComponent>,
    label: string,
    value: string,
  ): Promise<void> => {
    const input: HTMLInputElement | HTMLTextAreaElement = control(fixture, label);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const chips = (fixture: ComponentFixture<EditProfilePageComponent>, selector: string): string[] =>
    Array.from(element(fixture).querySelectorAll(`${selector} .chips-field__chip span`)).map(
      (chip) => chip.textContent.trim(),
    );

  const saveButton = (fixture: ComponentFixture<EditProfilePageComponent>): HTMLButtonElement =>
    element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const save = async (fixture: ComponentFixture<EditProfilePageComponent>): Promise<void> => {
    saveButton(fixture).click();
    await fixture.whenStable();
    await fixture.whenStable();
  };

  const sentData = (): IUpdateProfileData =>
    updateUserProfileData.mock.calls[0]![0] as IUpdateProfileData;

  beforeEach(() => {
    TestBed.resetTestingModule();
    getUserProfileData = vi.fn().mockReturnValue(of(profileData));
    updateUserProfileData = vi.fn().mockReturnValue(of(updatedProfile()));
    logout = vi.fn();
    snackbar = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
  });

  describe('prefill', () => {
    it('fills every field with the stored profile', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      expect(getUserProfileData).toHaveBeenCalledTimes(1);
      expect(control(fixture, 'Name').value).toBe('Ada');
      expect(control(fixture, 'Surname').value).toBe('Lovelace');
      expect(control(fixture, 'Email').value).toBe('ada@example.com');
      expect(control(fixture, 'Recovery email').value).toBe('backup@example.com');
      expect(control(fixture, 'Band name').value).toBe('The Engines');
      expect(control(fixture, 'Profile header').value).toBe('Engines in harmony');
      expect(control(fixture, 'Band description').value).toBe('Analytical soundscapes');
      expect(control(fixture, 'Telegram').value).toBe('https://t.me/engines');
      expect(control(fixture, 'Instagram').value).toBe('');
      expect(
        element(fixture).querySelector<HTMLInputElement>('input[type="radio"][value="Band"]')!
          .checked,
      ).toBe(true);
      expect(chips(fixture, '.edit-profile__main-genres')).toEqual(['Electronic', 'Ambient']);
      expect(chips(fixture, '.edit-profile__additional-genres')).toEqual(['Jazz']);
    });

    it('leaves optional fields blank and defaults to an artist when nothing is stored', async () => {
      getUserProfileData.mockReturnValue(of(emptyProfile));
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      expect(control(fixture, 'Recovery email').value).toBe('');
      expect(control(fixture, 'Artist name').value).toBe('');
      expect(control(fixture, 'Profile header').value).toBe('');
      expect(control(fixture, 'Telegram').value).toBe('');
      expect(
        element(fixture).querySelector<HTMLInputElement>('input[type="radio"][value="Artist"]')!
          .checked,
      ).toBe(true);
      expect(chips(fixture, '.edit-profile__main-genres')).toEqual([]);
    });

    it('does not offer a genre that is already picked in the other list', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      const mainOptions: string[] = Array.from(
        element(fixture).querySelectorAll<HTMLOptionElement>(
          '.edit-profile__main-genres select option',
        ),
      ).map((option) => option.value);

      expect(mainOptions).not.toContain('JAZZ');
      expect(mainOptions).not.toContain('ELECTRONIC');
      expect(mainOptions).toContain('ROCK');
    });

    it('reports a failed load and keeps saving locked', async () => {
      getUserProfileData.mockReturnValue(throwError(() => new Error('offline')));
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      expect(snackbar.error).toHaveBeenCalledWith(Constants.PROFILE_LOAD_FAILED);
      expect(saveButton(fixture).disabled).toBe(true);
    });
  });

  describe('save button', () => {
    it('stays disabled until something changes', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      expect(saveButton(fixture).disabled).toBe(true);

      await type(fixture, 'Name', 'Grace');

      expect(saveButton(fixture).disabled).toBe(false);
    });

    it('is disabled while a required field is empty', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Surname', '');

      expect(saveButton(fixture).disabled).toBe(true);
    });

    it('is disabled while a social link leads to another platform', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Telegram', 'https://instagram.com/engines');

      expect(saveButton(fixture).disabled).toBe(true);
      expect(element(fixture).textContent).toContain(
        `${ProfileValidationMessages.WRONG_SOCIAL_LINK} Telegram`,
      );
    });
  });

  describe('submit', () => {
    it('sends the edited profile and returns to the profile page', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Name', 'Grace');
      await type(fixture, 'Instagram', 'https://instagram.com/engines');
      await save(fixture);

      expect(sentData()).toEqual({
        name: 'Grace',
        surname: 'Lovelace',
        email: 'ada@example.com',
        recoveryEmail: 'backup@example.com',
        artistType: 'BAND',
        artistName: 'The Engines',
        description: 'Analytical soundscapes',
        shortDescription: 'Engines in harmony',
        socialLinks: {
          ...noSocialLinks,
          telegram: 'https://t.me/engines',
          instagram: 'https://instagram.com/engines',
        },
        mainGenres: ['ELECTRONIC', 'AMBIENT'],
        additionalGenres: ['JAZZ'],
      });
      expect(snackbar.success).toHaveBeenCalledWith(Constants.PROFILE_INFORMATION_SAVED);
      expect(navigate).toHaveBeenCalledWith([Links.PROFILE_URL]);
    });

    it('sends cleared optional fields as null', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Recovery email', '');
      await type(fixture, 'Band name', '   ');
      await type(fixture, 'Profile header', '');
      await type(fixture, 'Telegram', '');
      await save(fixture);

      expect(sentData()).toMatchObject({
        recoveryEmail: null,
        artistName: null,
        shortDescription: null,
        socialLinks: null,
      });
    });

    it('adds and removes genres', async () => {
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      element(fixture)
        .querySelector<HTMLButtonElement>(
          '.edit-profile__main-genres [aria-label="Remove Ambient"]',
        )!
        .click();
      const select: HTMLSelectElement = element(fixture).querySelector(
        '.edit-profile__additional-genres select',
      )!;
      select.value = 'ROCK';
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      await save(fixture);

      expect(sentData().mainGenres).toEqual(['ELECTRONIC']);
      expect(sentData().additionalGenres).toEqual(['JAZZ', 'ROCK']);
    });

    it('signs the user out when the email change requires a new sign-in', async () => {
      updateUserProfileData.mockReturnValue(of(updatedProfile(true)));
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Email', 'grace@example.com');
      await save(fixture);

      expect(snackbar.info).toHaveBeenCalledWith(Constants.EMAIL_CHANGED_SIGN_IN_AGAIN);
      expect(logout).toHaveBeenCalledTimes(1);
      expect(navigate).not.toHaveBeenCalledWith([Links.PROFILE_URL]);
    });

    it('shows a taken email next to the email field', async () => {
      updateUserProfileData.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: Constants.HTTP_CONFLICT_STATUS })),
      );
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Email', 'taken@example.com');
      await save(fixture);

      const emailField: HTMLElement = control(fixture, 'Email').closest('app-input-field')!;

      expect(emailField.textContent).toContain(ProfileValidationMessages.EMAIL_TAKEN);
      expect(snackbar.error).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('reports any other failure and stays on the page', async () => {
      updateUserProfileData.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

      await type(fixture, 'Name', 'Grace');
      await save(fixture);

      expect(snackbar.error).toHaveBeenCalledWith(Constants.PROFILE_SAVE_FAILED);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('returns to the profile page from the back and cancel buttons', async () => {
    const fixture: ComponentFixture<EditProfilePageComponent> = await createFixture();

    element(fixture).querySelector<HTMLButtonElement>('.edit-profile__back')!.click();
    element(fixture)
      .querySelector<HTMLButtonElement>('.edit-profile__actions button[type="button"]')!
      .click();

    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith([Links.PROFILE_URL]);
    expect(updateUserProfileData).not.toHaveBeenCalled();
  });
});
