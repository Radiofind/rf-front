import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ProfilePageComponent } from './profile-page.component';
import { UserService } from '../../../features/services/user-service/user.service';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';
import type { IUserProfileData } from '../../../core/models/user.model';

describe('ProfilePageComponent', () => {
  const profileData: IUserProfileData = {
    name: 'Ada',
    surname: 'Lovelace',
    dateOfBirth: '1994-03-07',
    artistType: 'BAND',
    artistName: 'The Engines',
    description: 'Analytical soundscapes',
    registeredAt: '2026-01-15T10:00:00.000000',
    avatarUrl: null,
  };

  let getUserProfileData: ReturnType<typeof vi.fn>;

  const createFixture = async (): Promise<ComponentFixture<ProfilePageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { getUserProfileData: getUserProfileData } },
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
  });

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
    expect(text(fixture, '.hero__bio')).toBe(Constants.DASH);
    expect(text(fixture, '.stats__item:last-child .stats__value')).toBe('Jan 2026');
    expect(text(fixture, '.details__title')).toBe('About Band');
    expect(text(fixture, '.details__text')).toBe('Analytical soundscapes');
    expect(detailValues(fixture)).toEqual(['The Engines', 'Mar 7, 1994']);
  });

  it('falls back to artist wording and placeholders for missing optional fields', async () => {
    getUserProfileData = vi
      .fn()
      .mockReturnValue(
        of({ ...profileData, artistType: null, artistName: null, description: null }),
      );

    const fixture: ComponentFixture<ProfilePageComponent> = await createFixture();

    expect(text(fixture, '.hero__meta span')).toBe('Artist');
    expect(text(fixture, '.hero__bio')).toBe(Constants.DASH);
    expect(text(fixture, '.details__title')).toBe('About Artist');
    expect(text(fixture, '.details__text')).toBe(Constants.DASH);
    expect(detailValues(fixture)[0]).toBe(Constants.DASH);
  });
});
