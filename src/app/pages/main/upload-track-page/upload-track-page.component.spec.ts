import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UploadTrackPageComponent } from './upload-track-page.component';
import { UserService } from '../../../features/services/user-service/user.service';
import { TrackService } from '../../../features/services/track-service/track.service';
import { NotificationStateService } from '../../../features/services/notification-state-service/notification-state.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { UPLOAD_TRACK_MESSAGES } from '../../../features/constants/upload-track.constant';
import { Constants } from '../../../core/constants/constants';
import { Links } from '../../../core/constants/links';

import type { ComponentFixture } from '@angular/core/testing';
import type { IUserProfileData } from '../../../core/models/user.model';
import type { IUploadTrackData } from '../../../core/models/track.model';

describe('UploadTrackPageComponent', () => {
  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: null,
    dateOfBirth: '1994-03-07',
    artistType: 'BAND',
    artistName: 'The Engines',
    description: null,
    shortDescription: null,
    socialLinks: null,
    mainGenres: [],
    additionalGenres: [],
    registeredAt: '2026-01-15T10:00:00Z',
    uploadsCount: 0,
    avatarUrl: null,
  };

  let getUserProfileData: ReturnType<typeof vi.fn>;
  let uploadTrack: ReturnType<typeof vi.fn>;
  let loadNotifications: ReturnType<typeof vi.fn>;
  let snackbar: Record<'success' | 'error', ReturnType<typeof vi.fn>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  const createFixture = async (): Promise<ComponentFixture<UploadTrackPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [UploadTrackPageComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { getUserProfileData: getUserProfileData } },
        { provide: TrackService, useValue: { uploadTrack: uploadTrack } },
        {
          provide: NotificationStateService,
          useValue: { loadNotifications: loadNotifications },
        },
        { provide: SnackbarService, useValue: snackbar },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const fixture: ComponentFixture<UploadTrackPageComponent> =
      TestBed.createComponent(UploadTrackPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<UploadTrackPageComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const control = (
    fixture: ComponentFixture<UploadTrackPageComponent>,
    label: string,
  ): HTMLInputElement | HTMLTextAreaElement =>
    Array.from(element(fixture).querySelectorAll('app-input-field'))
      .find((field) => field.querySelector('.label')!.textContent.trim().startsWith(label))!
      .querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')!;

  const type = async (
    fixture: ComponentFixture<UploadTrackPageComponent>,
    label: string,
    value: string,
  ): Promise<void> => {
    const input: HTMLInputElement | HTMLTextAreaElement = control(fixture, label);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const chooseFile = async (
    fixture: ComponentFixture<UploadTrackPageComponent>,
    inputId: string,
    file: File,
  ): Promise<void> => {
    const input: HTMLInputElement = element(fixture).querySelector(`#${inputId}`)!;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: { item: (): File => file, length: 1 },
    });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  const clickOption = async (
    fixture: ComponentFixture<UploadTrackPageComponent>,
    label: string,
  ): Promise<void> => {
    Array.from(document.querySelectorAll<HTMLButtonElement>('.dropdown-menu__item'))
      .find((option) => option.textContent.trim() === label)!
      .click();
    await fixture.whenStable();
  };

  const openGenres = async (fixture: ComponentFixture<UploadTrackPageComponent>): Promise<void> => {
    element(fixture).querySelector<HTMLButtonElement>('.chips-field__trigger')!.click();
    await fixture.whenStable();
  };

  const addGenre = async (
    fixture: ComponentFixture<UploadTrackPageComponent>,
    group: string,
    genre: string,
  ): Promise<void> => {
    await openGenres(fixture);
    await clickOption(fixture, group);
    await clickOption(fixture, genre);
  };

  const genreChips = (fixture: ComponentFixture<UploadTrackPageComponent>): string[] =>
    Array.from(element(fixture).querySelectorAll('.chips-field__chip span')).map((chip) =>
      chip.textContent.trim(),
    );

  const uploadButton = (fixture: ComponentFixture<UploadTrackPageComponent>): HTMLButtonElement =>
    element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const audio: File = new File(['audio'], 'song.mp3');

  const fillRequired = async (
    fixture: ComponentFixture<UploadTrackPageComponent>,
  ): Promise<void> => {
    await chooseFile(fixture, 'upload-track-audio', audio);
    await type(fixture, 'Track Title', '  Midnight Dreams  ');
    await addGenre(fixture, 'Rock', 'Grunge');
  };

  const upload = async (fixture: ComponentFixture<UploadTrackPageComponent>): Promise<void> => {
    uploadButton(fixture).click();
    await fixture.whenStable();
    await fixture.whenStable();
  };

  const sentData = (): IUploadTrackData => uploadTrack.mock.calls[0]![0] as IUploadTrackData;

  beforeEach(() => {
    TestBed.resetTestingModule();
    getUserProfileData = vi.fn().mockReturnValue(of(profileData));
    uploadTrack = vi.fn().mockReturnValue(of({ id: 42 }));
    loadNotifications = vi.fn().mockResolvedValue(undefined);
    snackbar = { success: vi.fn(), error: vi.fn() };
  });

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  describe('artist', () => {
    it('shows the band name of a band account in a read-only field labelled band', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      const artist: HTMLInputElement = control(fixture, 'Band *') as HTMLInputElement;
      const label: string = artist.closest('.field')!.querySelector('.label')!.textContent;

      expect(artist.value).toBe('The Engines');
      expect(artist.readOnly).toBe(true);
      expect(label).toContain('(from your account)');
    });

    it.each([
      ['ARTIST' as const, 'Artist *'],
      [null, 'Artist *'],
    ])('labels the field as artist for the account type %s', async (artistType, label) => {
      getUserProfileData.mockReturnValue(of({ ...profileData, artistType: artistType }));
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      expect(control(fixture, label).value).toBe('The Engines');
    });

    it('falls back to the full name when the account has no artist name', async () => {
      getUserProfileData.mockReturnValue(of({ ...profileData, artistName: '  ' }));
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      expect(control(fixture, 'Band *').value).toBe('Ada Lovelace');
    });

    it('reports a failed profile load', async () => {
      getUserProfileData.mockReturnValue(throwError(() => new Error('offline')));
      await createFixture();

      expect(snackbar.error).toHaveBeenCalledWith(Constants.PROFILE_LOAD_FAILED);
    });
  });

  describe('genres', () => {
    it('collects up to three genres as chips', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      await addGenre(fixture, 'Rock', 'Grunge');
      await addGenre(fixture, 'Rock', 'Indie Rock');
      await addGenre(fixture, 'Jazz', 'Bebop');

      expect(genreChips(fixture)).toEqual(['Grunge', 'Indie Rock', 'Bebop']);
      expect(element(fixture).querySelector('.chips-field__counter')!.textContent).toBe('3/3');
      expect(element(fixture).querySelector('.chips-field__trigger')).toBeNull();
    });

    it('does not offer a genre that is already chosen', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await addGenre(fixture, 'Rock', 'Grunge');

      await openGenres(fixture);
      await clickOption(fixture, 'Rock');
      const options: string[] = Array.from(
        document.querySelectorAll<HTMLButtonElement>('.dropdown-menu__item'),
      ).map((option) => option.textContent.trim());

      expect(options).not.toContain('Grunge');
      expect(options).toContain('Indie Rock');
    });
  });

  describe('upload', () => {
    it('stays locked until the audio, the title and the genre are given', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      expect(uploadButton(fixture).disabled).toBe(true);

      await fillRequired(fixture);

      expect(uploadButton(fixture).disabled).toBe(false);
    });

    it('sends the trimmed details with empty optional fields as null', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await fillRequired(fixture);

      await upload(fixture);

      expect(sentData()).toEqual({
        title: 'Midnight Dreams',
        genres: ['GRUNGE'],
        description: null,
        audio: audio,
        cover: null,
      });
    });

    it('sends every chosen genre, the description and the cover when given', async () => {
      const cover: File = new File(['image'], 'cover.png');
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await fillRequired(fixture);
      await addGenre(fixture, 'Rock', 'Indie Rock');
      await type(fixture, 'Description', ' Late night drive ');
      await chooseFile(fixture, 'upload-track-cover', cover);

      await upload(fixture);

      expect(sentData()).toMatchObject({
        genres: ['GRUNGE', 'INDIE_ROCK'],
        description: 'Late night drive',
        cover: cover,
      });
    });

    it('confirms the upload, refreshes the notifications and opens my uploads', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await fillRequired(fixture);

      await upload(fixture);

      expect(snackbar.success).toHaveBeenCalledWith(UPLOAD_TRACK_MESSAGES.uploaded);
      expect(loadNotifications).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith([Links.MY_UPLOADS_URL]);
    });

    it.each([
      [413, UPLOAD_TRACK_MESSAGES.tooLarge],
      [415, UPLOAD_TRACK_MESSAGES.unsupportedFormat],
      [500, UPLOAD_TRACK_MESSAGES.uploadFailed],
    ])('explains a %i response and stays on the page', async (status, message) => {
      uploadTrack.mockReturnValue(throwError(() => new HttpErrorResponse({ status: status })));
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await fillRequired(fixture);

      await upload(fixture);

      expect(snackbar.error).toHaveBeenCalledWith(message);
      expect(navigate).not.toHaveBeenCalled();
      expect(loadNotifications).not.toHaveBeenCalled();
    });
  });

  describe('unsaved changes', () => {
    const unloadEvent = (): BeforeUnloadEvent => new Event('beforeunload', { cancelable: true });

    it('has none on an untouched form', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(false);
    });

    it('has some once a field is typed into', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      await type(fixture, 'Track Title', 'Midnight Dreams');

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(true);
    });

    it('has some once a file is chosen', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();

      await chooseFile(fixture, 'upload-track-audio', audio);

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(true);
    });

    it('has none after a successful upload', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await fillRequired(fixture);

      await upload(fixture);

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(false);
    });

    it('keeps them after a failed upload', async () => {
      uploadTrack.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await fillRequired(fixture);

      await upload(fixture);

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(true);
    });

    it('asks the browser to confirm leaving while there are changes', async () => {
      const fixture: ComponentFixture<UploadTrackPageComponent> = await createFixture();
      await type(fixture, 'Track Title', 'Midnight Dreams');
      const event: BeforeUnloadEvent = unloadEvent();

      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('lets the browser leave without a prompt on an untouched form', async () => {
      await createFixture();
      const event: BeforeUnloadEvent = unloadEvent();

      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });
});
