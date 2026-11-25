import { describe, expect, it, vi } from 'vitest';
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
    expect(labels(fixture)).toEqual(['Artist Name', 'Date of Birth', 'Additional Genres']);
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

  describe('tabs', () => {
    const tabs = (fixture: ComponentFixture<ProfileDetailsComponent>): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));

    const tab = (
      fixture: ComponentFixture<ProfileDetailsComponent>,
      label: string,
    ): HTMLButtonElement =>
      tabs(fixture).find((button: HTMLButtonElement) => button.textContent.trim() === label)!;

    const visiblePanels = (fixture: ComponentFixture<ProfileDetailsComponent>): string[] =>
      Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'))
        .filter((panel: HTMLElement) => !panel.hidden)
        .map((panel: HTMLElement) => panel.getAttribute('aria-labelledby') ?? '');

    it('offers only the About tab when the statistics are not shown', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
      await fixture.whenStable();

      expect(tabs(fixture).map((button: HTMLButtonElement) => button.textContent.trim())).toEqual([
        'About',
      ]);
      expect(fixture.nativeElement.querySelectorAll('[role="tabpanel"]').length).toBe(1);
    });

    it('opens on the About tab when the statistics are shown', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();

      fixture.componentRef.setInput('statisticsVisible', true);
      await fixture.whenStable();

      expect(
        tabs(fixture).map((button: HTMLButtonElement) => [
          button.textContent.trim(),
          button.getAttribute('aria-selected'),
        ]),
      ).toEqual([
        ['About', 'true'],
        ['Statistics', 'false'],
      ]);
      expect(visiblePanels(fixture)).toEqual(['profile-tab-ABOUT']);
    });

    it('shows the statistics panel once its tab is chosen', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
      fixture.componentRef.setInput('statisticsVisible', true);
      await fixture.whenStable();

      tab(fixture, 'Statistics').click();
      await fixture.whenStable();

      expect(tab(fixture, 'Statistics').getAttribute('aria-selected')).toBe('true');
      expect(visiblePanels(fixture)).toEqual(['profile-tab-STATISTICS']);
    });

    it('reports the statistics as opened only the first time their tab is chosen', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
      fixture.componentRef.setInput('statisticsVisible', true);
      const opened = vi.fn();
      fixture.componentInstance.statisticsOpened.subscribe(opened);
      await fixture.whenStable();

      tab(fixture, 'Statistics').click();
      tab(fixture, 'About').click();
      tab(fixture, 'Statistics').click();

      expect(opened).toHaveBeenCalledOnce();
    });

    it.each([['ArrowRight'], ['ArrowLeft']])(
      'moves the focus to the other tab with %s',
      async (key: string) => {
        const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
        fixture.componentRef.setInput('statisticsVisible', true);
        await fixture.whenStable();

        tab(fixture, 'About').dispatchEvent(new KeyboardEvent('keydown', { key: key }));
        await fixture.whenStable();

        expect(document.activeElement).toBe(tab(fixture, 'Statistics'));
        expect(visiblePanels(fixture)).toEqual(['profile-tab-STATISTICS']);
      },
    );

    it('keeps the focusable tab on the selected one only', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
      fixture.componentRef.setInput('statisticsVisible', true);
      await fixture.whenStable();

      tab(fixture, 'Statistics').click();
      await fixture.whenStable();

      expect(tabs(fixture).map((button: HTMLButtonElement) => button.tabIndex)).toEqual([-1, 0]);
    });
  });

  describe('genres', () => {
    const genresValue = (fixture: ComponentFixture<ProfileDetailsComponent>): HTMLElement =>
      (fixture.nativeElement as HTMLElement).querySelector('.details__field--full dd')!;

    const chipLabels = (fixture: ComponentFixture<ProfileDetailsComponent>): string[] =>
      Array.from(genresValue(fixture).querySelectorAll('.chips-field__chip')).map((chip) =>
        chip.textContent.trim(),
      );

    it('shows a dash when there are no additional genres', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();
      await fixture.whenStable();

      expect(genresValue(fixture).textContent.trim()).toBe(Constants.DASH);
      expect(genresValue(fixture).querySelector('app-chips-field')).toBeNull();
    });

    it('renders the additional genres as chips with readable labels', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();

      fixture.componentRef.setInput('additionalGenres', ['ACID_JAZZ', 'DEEP_HOUSE', 'Shoegaze']);
      await fixture.whenStable();

      expect(chipLabels(fixture)).toEqual(['Acid Jazz', 'Deep House', 'Shoegaze']);
    });

    it('shows the genres read-only', async () => {
      const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();

      fixture.componentRef.setInput('additionalGenres', ['JAZZ']);
      await fixture.whenStable();

      expect(genresValue(fixture).querySelector('button')).toBeNull();
      expect(genresValue(fixture).querySelector('select')).toBeNull();
    });
  });

  it('leaves out the date of birth when it is not shared', async () => {
    const fixture: ComponentFixture<ProfileDetailsComponent> = await createFixture();

    fixture.componentRef.setInput('birthdayDate', null);
    await fixture.whenStable();

    expect(labels(fixture)).toEqual(['Artist Name', 'Additional Genres']);
  });
});
