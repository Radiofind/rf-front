import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileHeroComponent } from './profile-hero.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { Mock } from 'vitest';
import type { ISocialLinksData } from '../../../../core/models/user.model';

describe('ProfileHeroComponent', () => {
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

  const spotifyUrl: string = 'https://open.spotify.com/artist/ada';

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

  it('hides the genres and their separator until genres are bound', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.hero__meta span')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.hero__meta-dot')).toBeNull();
  });

  it('renders the bound genres after the role', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

    fixture.componentRef.setInput('mainGenres', 'Rock / Hip Hop');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.hero__meta-dot')).not.toBeNull();
    expect(text(fixture, '.hero__meta span:last-child')).toBe('Rock / Hip Hop');
  });

  it('gives every icon-only control an accessible name', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

    fixture.componentRef.setInput('socialLinks', { ...noSocialLinks, spotify: spotifyUrl });
    await fixture.whenStable();

    const labels: (string | null)[] = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.hero__social, .hero__avatar-edit, .hero__edit'),
    ).map((element: HTMLElement) => element.getAttribute('aria-label'));

    expect(labels).toEqual(['Change avatar', 'Spotify', 'Edit profile']);
  });

  describe('social links', () => {
    const socials = (fixture: ComponentFixture<ProfileHeroComponent>): HTMLAnchorElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('.hero__social'));

    it('renders no social list while there are no links', async () => {
      const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.hero__socials')).toBeNull();

      fixture.componentRef.setInput('socialLinks', noSocialLinks);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.hero__socials')).toBeNull();
    });

    it('shows only the platforms with a saved link, in the edit page order', async () => {
      const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

      fixture.componentRef.setInput('socialLinks', {
        ...noSocialLinks,
        tiktok: 'https://tiktok.com/@ada',
        telegram: 'https://t.me/ada',
        instagram: '   ',
      });
      await fixture.whenStable();

      expect(socials(fixture).map((link) => link.getAttribute('aria-label'))).toEqual([
        'Telegram',
        'TikTok',
      ]);
    });

    it('links every icon to the saved url in a new tab', async () => {
      const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();

      fixture.componentRef.setInput('socialLinks', { ...noSocialLinks, spotify: spotifyUrl });
      await fixture.whenStable();

      const [link] = socials(fixture);

      expect(link!.getAttribute('href')).toBe(spotifyUrl);
      expect(link!.target).toBe('_blank');
      expect(link!.rel).toBe('noopener noreferrer');
      expect(Array.from(link!.querySelector('i')!.classList).sort()).toEqual(['bx-spotify', 'bxl']);
    });
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

  it('asks to edit the profile when the edit button is clicked', async () => {
    const fixture: ComponentFixture<ProfileHeroComponent> = await createFixture();
    await fixture.whenStable();

    const profileEdit: Mock<() => void> = vi.fn<() => void>();
    fixture.componentInstance.profileEdit.subscribe(profileEdit);

    fixture.nativeElement.querySelector('.hero__edit').click();

    expect(profileEdit).toHaveBeenCalledTimes(1);
  });
});
