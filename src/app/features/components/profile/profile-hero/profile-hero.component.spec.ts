import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileHeroComponent } from './profile-hero.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { Mock } from 'vitest';

describe('ProfileHeroComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<ProfileHeroComponent>> => {
    await TestBed.configureTestingModule({ imports: [ProfileHeroComponent] }).compileComponents();
    return TestBed.createComponent(ProfileHeroComponent);
  };

  const text = (fixture: ComponentFixture<ProfileHeroComponent>, selector: string): string =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)!.textContent.trim();

  it('shows placeholders until the profile data is bound', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
    await fixture.whenStable();

    expect(text(fixture, '.hero__name')).toBe(Constants.DASH);
    expect(text(fixture, '.hero__bio')).toBe(Constants.DASH);
    expect(text(fixture, '.hero__meta span')).toBe('Artist');
  });

  it('renders the full name and the bio', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

    fixture.componentRef.setInput('userFullName', 'Ada Lovelace');
    fixture.componentRef.setInput('bio', 'Analytical soundscapes');
    await fixture.whenStable();

    expect(text(fixture, '.hero__name')).toBe('Ada Lovelace');
    expect(text(fixture, '.hero__bio')).toBe('Analytical soundscapes');
  });

  it('labels a solo artist as an artist', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

    fixture.componentRef.setInput('artistType', ArtistTypeRequestEnum.ARTIST);
    await fixture.whenStable();

    expect(text(fixture, '.hero__meta span')).toBe('Artist');
  });

  it('labels a band account as a band member', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

    fixture.componentRef.setInput('artistType', ArtistTypeRequestEnum.BAND);
    await fixture.whenStable();

    expect(text(fixture, '.hero__meta span')).toBe('Member of band');
  });

  it('gives every icon-only control an accessible name', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
    await fixture.whenStable();

    const labels: (string | null)[] = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.hero__social, .hero__avatar-edit, .hero__edit'),
    ).map((element: HTMLElement) => element.getAttribute('aria-label'));

    expect(labels).toEqual([
      'Change avatar',
      'Spotify',
      'SoundCloud',
      'YouTube',
      'X',
      'Edit profile',
    ]);
  });

  it('shows the placeholder until an avatar is bound', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.hero__avatar-photo')).toBeNull();
    expect(fixture.nativeElement.querySelector('.hero__avatar-image')).not.toBeNull();
  });

  it('renders the bound avatar', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

    fixture.componentRef.setInput('avatarUrl', 'blob:avatar');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.hero__avatar-photo').getAttribute('src')).toBe(
      'blob:avatar',
    );
    expect(fixture.nativeElement.querySelector('.hero__avatar-image')).toBeNull();
  });

  it('asks to edit the avatar when the avatar button is clicked', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
    await fixture.whenStable();

    const avatarEdit: Mock<() => void> = vi.fn<() => void>();
    fixture.componentInstance.avatarEdit.subscribe(avatarEdit);

    fixture.nativeElement.querySelector('.hero__avatar-edit').click();

    expect(avatarEdit).toHaveBeenCalledTimes(1);
  });
});
