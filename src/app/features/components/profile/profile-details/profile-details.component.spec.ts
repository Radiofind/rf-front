import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileDetailsComponent } from './profile-details.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';

import type { ComponentFixture } from '@angular/core/testing';

describe('ProfileDetailsComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<ProfileDetailsComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ProfileDetailsComponent],
    }).compileComponents();
    return TestBed.createComponent(ProfileDetailsComponent);
  };

  const text = (fixture: ComponentFixture<ProfileDetailsComponent>, selector: string): string =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)!.textContent.trim();

  const labels = (fixture: ComponentFixture<ProfileDetailsComponent>): string[] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.details__label')).map(
      (label: HTMLElement) => label.textContent.trim(),
    );

  const values = (fixture: ComponentFixture<ProfileDetailsComponent>): string[] =>
    Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.details__field:not(.details__field--full) dd'),
    ).map((value: HTMLElement) => value.textContent.trim());

  it('shows placeholders and artist labels by default', async () => {
    const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
    await fixture.whenStable();

    expect(text(fixture, '.details__title')).toBe('About Artist');
    expect(text(fixture, '.details__text')).toBe(Constants.DASH);
    expect(labels(fixture)).toEqual(['Artist Name', 'Date of Birth', 'Genres']);
    expect(values(fixture)).toEqual([Constants.DASH, Constants.DASH]);
  });

  it('renders the bound profile details', async () => {
    const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();

    fixture.componentRef.setInput('description', 'Analytical soundscapes');
    fixture.componentRef.setInput('artistName', 'The Engines');
    fixture.componentRef.setInput('birthdayDate', 'Dec 10, 1815');
    await fixture.whenStable();

    expect(text(fixture, '.details__text')).toBe('Analytical soundscapes');
    expect(values(fixture)).toEqual(['The Engines', 'Dec 10, 1815']);
  });

  it('switches the labels to band wording for a band account', async () => {
    const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();

    fixture.componentRef.setInput('artistType', ArtistTypeRequestEnum.BAND);
    await fixture.whenStable();

    expect(text(fixture, '.details__title')).toBe('About Band');
    expect(labels(fixture)[0]).toBe('Band Name');
  });

  it('opens on the About tab with the Stats panel hidden', async () => {
    const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
    await fixture.whenStable();

    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    );

    expect(tabs.map((tab: HTMLButtonElement) => tab.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ]);
    expect(fixture.nativeElement.querySelector('#profile-panel-about').hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('#profile-panel-stats').hidden).toBe(true);
  });

  it('renders genres as buttons', async () => {
    const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
    await fixture.whenStable();

    const chips: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.details__chip'),
    );

    expect(chips.length).toBeGreaterThan(0);
    expect(chips.every((chip: HTMLButtonElement) => chip.type === 'button')).toBe(true);
  });
});
