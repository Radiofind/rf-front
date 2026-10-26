import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GeneralSettingsPageComponent } from './general-settings-page.component';
import { SettingsStateService } from '../../../../features/services/settings-state-service/settings-state.service';
import { SnackbarService } from '../../../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../../../core/constants/constants';

import type { WritableSignal } from '@angular/core';
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

  let settings: WritableSignal<IGeneralSettings>;
  let isLoaded: WritableSignal<boolean>;
  let loadSettings: ReturnType<typeof vi.fn>;
  let updateSettings: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;

  const createFixture = async (): Promise<ComponentFixture<GeneralSettingsPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [GeneralSettingsPageComponent],
      providers: [
        {
          provide: SettingsStateService,
          useValue: {
            settings: settings.asReadonly(),
            isLoaded: isLoaded.asReadonly(),
            loadSettings: loadSettings,
            updateSettings: updateSettings,
          },
        },
        { provide: SnackbarService, useValue: { error: error } },
      ],
    }).compileComponents();

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
  ): string => row(fixture, id).querySelector('.select__value')!.textContent.trim();

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
    Array.from(document.querySelectorAll<HTMLButtonElement>('.dropdown-menu__item'))
      .find((item) => item.textContent.trim() === label)!
      .click();
    await fixture.whenStable();
  };

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    settings = signal<IGeneralSettings>(storedSettings);
    isLoaded = signal<boolean>(true);
    loadSettings = vi.fn().mockResolvedValue(true);
    updateSettings = vi.fn().mockResolvedValue(undefined);
    error = vi.fn();
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

    settings.set({ ...storedSettings, language: 'IT', notificationsEnabled: true });
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

      expect(updateSettings).toHaveBeenCalledWith({ language: 'FR' });
    });

    it('saves the radio-mode toggle', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      toggle(fixture, 'settings-radio-mode').click();
      await fixture.whenStable();

      expect(updateSettings).toHaveBeenCalledWith({ radioMode: false });
    });

    it('saves a new profile visibility', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      await choose(fixture, 'settings-profile-visibility', 'Only me');

      expect(updateSettings).toHaveBeenCalledWith({ profileVisibility: 'ONLY_ME' });
    });

    it('saves the notifications toggle', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      toggle(fixture, 'settings-notifications').click();
      await fixture.whenStable();

      expect(updateSettings).toHaveBeenCalledWith({ notificationsEnabled: true });
    });

    it('saves a new audio quality', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      await choose(fixture, 'settings-audio-quality', 'High (320 kbps)');

      expect(updateSettings).toHaveBeenCalledWith({ audioQuality: 'HIGH' });
    });

    it('saves a new accent color', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      swatches(fixture)
        .find((swatch) => swatch.value === 'PLUM')!
        .click();
      await fixture.whenStable();

      expect(updateSettings).toHaveBeenCalledWith({ accentColor: 'PLUM' });
    });

    it('does not save a value that did not change', async () => {
      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();

      fixture.componentInstance.onSettingChange('language', 'DE');

      expect(updateSettings).not.toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    it('does not request the settings again when they are already loaded', async () => {
      await createFixture();

      expect(loadSettings).not.toHaveBeenCalled();
    });

    it('loads the settings when the page is opened before they arrive', async () => {
      isLoaded.set(false);

      await createFixture();

      expect(loadSettings).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('locks every control until the settings are loaded', async () => {
      isLoaded.set(false);
      loadSettings.mockReturnValue(new Promise<boolean>(() => undefined));

      const fixture: ComponentFixture<GeneralSettingsPageComponent> = await createFixture();
      const controls: (HTMLInputElement | HTMLButtonElement)[] = Array.from(
        fixture.nativeElement.querySelectorAll('.select__control, input'),
      );

      expect(controls).toHaveLength(9);
      expect(controls.every((control) => control.disabled)).toBe(true);

      isLoaded.set(true);
      await fixture.whenStable();

      expect(controls.every((control) => !control.disabled)).toBe(true);
    });

    it('reports a failed load', async () => {
      isLoaded.set(false);
      loadSettings.mockResolvedValue(false);

      await createFixture();

      await vi.waitFor(() => {
        expect(error).toHaveBeenCalledWith(Constants.SETTINGS_LOAD_FAILED);
      });
    });
  });
});
