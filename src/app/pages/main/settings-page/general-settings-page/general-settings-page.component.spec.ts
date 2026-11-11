import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GeneralSettingsPageComponent } from './general-settings-page.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { GeneralSettingsPageActions } from '../../../../store/ui/general-settings-page.actions';
import { settingsFeature } from '../../../../store/settings/settings.feature';

import type { ComponentFixture } from '@angular/core/testing';
import type { IGeneralSettings } from '../../../../core/models/settings.model';

describe('GeneralSettingsPageComponent', () => {
  const storedSettings: IGeneralSettings = {
    language: 'DE',
    radioMode: true,
    profileVisibility: 'FOLLOWERS',
    notificationsEnabled: false,
    audioQuality: 'NORMAL',
    accentColor: 'ORCHID',
  };

  let isLoaded: boolean;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;

  const createFixture = async (): Promise<ComponentFixture<GeneralSettingsPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [GeneralSettingsPageComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: settingsFeature.selectSettings, value: storedSettings },
            { selector: settingsFeature.selectIsLoaded, value: isLoaded },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatch = vi.spyOn(store, 'dispatch');

    const fixture: ComponentFixture<GeneralSettingsPageComponent> = TestBed.createComponent(
      GeneralSettingsPageComponent,
    );
    await fixture.whenStable();

    return fixture;
  };

  const row = (fixture: ComponentFixture<GeneralSettingsPageComponent>, id: string): HTMLElement =>
    (fixture.nativeElement as HTMLElement)
      .querySelector(`#${id}-title`)!
      .closest('app-settings-row')!;

  const select = (
    fixture: ComponentFixture<GeneralSettingsPageComponent>,
    id: string,
  ): HTMLButtonElement => row(fixture, id).querySelector('.select__control')!;

  const selectedLabel = (
    fixture: ComponentFixture<GeneralSettingsPageComponent>,
    id: string,
  ): string => row(fixture, id).querySelector('.select__text')!.textContent.trim();

  const toggle = (
    fixture: ComponentFixture<GeneralSettingsPageComponent>,
    id: string,
  ): HTMLInputElement => row(fixture, id).querySelector('input[role="switch"]')!;

  const swatches = (fixture: ComponentFixture<GeneralSettingsPageComponent>): HTMLInputElement[] =>
    Array.from(row(fixture, 'settings-accent-color').querySelectorAll('input[type="radio"]'));

  const choose = async (
    fixture: ComponentFixture<GeneralSettingsPageComponent>,
    id: string,
    label: string,
  ): Promise<void> => {
    select(fixture, id).click();
    await fixture.whenStable();
    Array.from(document.querySelectorAll<HTMLElement>('.dropdown-menu__text'))
      .find((text) => text.textContent.trim() === label)!
      .click();
    await fixture.whenStable();
  };

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    isLoaded = true;
  });

  it('renders every general setting from the mockup in order', async () => {
    const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

    const titles: string[] = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.row__title'),
    ).map((title) => title.textContent.trim());

    expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('General Settings');
    expect(titles).toEqual([
      'Language',
      'Radio-mode',
      'Profile Visibility',
      'Notifications',
      'Audio Quality',
      'Accent Color',
    ]);
  });

  it('shows the current settings in the controls', async () => {
    const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

    expect(selectedLabel(fixture, 'settings-language')).toBe('Deutsch');
    expect(toggle(fixture, 'settings-radio-mode').checked).toBe(true);
    expect(selectedLabel(fixture, 'settings-profile-visibility')).toBe('Followers only');
    expect(toggle(fixture, 'settings-notifications').checked).toBe(false);
    expect(selectedLabel(fixture, 'settings-audio-quality')).toBe('Normal (160 kbps)');
    expect(swatches(fixture).find((swatch) => swatch.checked)?.value).toBe('ORCHID');
  });

  it('follows changes of the shared settings state', async () => {
    const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

    store.overrideSelector(settingsFeature.selectSettings, {
      ...storedSettings,
      language: 'IT',
      notificationsEnabled: true,
    });
    store.refreshState();
    await fixture.whenStable();

    expect(selectedLabel(fixture, 'settings-language')).toBe('Italiano');
    expect(toggle(fixture, 'settings-notifications').checked).toBe(true);
  });

  it('labels every control with its row title and description', async () => {
    const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

    const language: HTMLButtonElement = select(fixture, 'settings-language');
    const radioMode: HTMLInputElement = toggle(fixture, 'settings-radio-mode');

    expect(language.getAttribute('aria-labelledby')).toBe(`settings-language-title ${language.id}`);
    expect(language.getAttribute('aria-describedby')).toBe('settings-language-description');
    expect(radioMode.getAttribute('aria-labelledby')).toBe('settings-radio-mode-title');
  });

  describe('saving', () => {
    it('saves a new language', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      await choose(fixture, 'settings-language', 'Français');

      expect(dispatch).toHaveBeenLastCalledWith(
        GeneralSettingsPageActions.settingChanged({ changes: { language: 'FR' } }),
      );
    });

    it('saves the radio-mode toggle', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      toggle(fixture, 'settings-radio-mode').click();
      await fixture.whenStable();

      expect(dispatch).toHaveBeenLastCalledWith(
        GeneralSettingsPageActions.settingChanged({ changes: { radioMode: false } }),
      );
    });

    it('saves a new profile visibility', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      await choose(fixture, 'settings-profile-visibility', 'Only me');

      expect(dispatch).toHaveBeenLastCalledWith(
        GeneralSettingsPageActions.settingChanged({ changes: { profileVisibility: 'ONLY_ME' } }),
      );
    });

    it('saves the notifications toggle', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      toggle(fixture, 'settings-notifications').click();
      await fixture.whenStable();

      expect(dispatch).toHaveBeenLastCalledWith(
        GeneralSettingsPageActions.settingChanged({ changes: { notificationsEnabled: true } }),
      );
    });

    it('saves a new audio quality', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      await choose(fixture, 'settings-audio-quality', 'High (320 kbps)');

      expect(dispatch).toHaveBeenLastCalledWith(
        GeneralSettingsPageActions.settingChanged({ changes: { audioQuality: 'HIGH' } }),
      );
    });

    it('saves a new accent color', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      swatches(fixture)
        .find((swatch) => swatch.value === 'PLUM')!
        .click();
      await fixture.whenStable();

      expect(dispatch).toHaveBeenLastCalledWith(
        GeneralSettingsPageActions.settingChanged({ changes: { accentColor: 'PLUM' } }),
      );
    });

    it('does not save a value that did not change', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      fixture.componentInstance.onSettingChange('language', 'DE');

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: GeneralSettingsPageActions.settingChanged.type }),
      );
    });
  });

  it('reports the page as opened on init', async () => {
    await createFixture();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(GeneralSettingsPageActions.opened());
  });

  it('locks every control until the settings are loaded', async () => {
    isLoaded = false;

    const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();
    const controls: (HTMLInputElement | HTMLButtonElement)[] = Array.from(
      fixture.nativeElement.querySelectorAll('.select__control, input'),
    );

    expect(controls).toHaveLength(9);
    expect(controls.every((control) => control.disabled)).toBe(true);

    store.overrideSelector(settingsFeature.selectIsLoaded, true);
    store.refreshState();
    await fixture.whenStable();

    expect(controls.every((control) => !control.disabled)).toBe(true);
  });
});
