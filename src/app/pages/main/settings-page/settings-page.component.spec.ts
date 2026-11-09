import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SettingsPageComponent } from './settings-page.component';
import { SETTINGS_ROUTES } from './settings.routes';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { settingsFeature } from '../../../store/settings/settings.feature';
import { DEFAULT_GENERAL_SETTINGS } from '../../../features/constants/settings.constant';
import { Links } from '../../../core/constants/links';

describe('SettingsPageComponent', () => {
  let harness: RouterTestingHarness;

  const element = (): HTMLElement => harness.routeNativeElement!;

  const navLinks = (): HTMLAnchorElement[] =>
    Array.from(element().querySelectorAll<HTMLAnchorElement>('.settings__nav-item'));

  const activeLink = (): HTMLAnchorElement | null =>
    element().querySelector<HTMLAnchorElement>('.settings__nav-item--active');

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
  });

  beforeEach(async () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: Links.SETTINGS_URL,
            component: SettingsPageComponent,
            children: SETTINGS_ROUTES,
          },
        ]),
        provideMockStore({
          selectors: [
            { selector: settingsFeature.selectSettings, value: DEFAULT_GENERAL_SETTINGS },
            { selector: settingsFeature.selectIsLoaded, value: true },
          ],
        }),
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('renders the hero with the page title', async () => {
    await harness.navigateByUrl('/settings/general');

    expect(element().querySelector('.settings__title')!.textContent.trim()).toBe('Settings');
    expect(element().querySelector('.settings__subtitle')!.textContent.trim()).toBe(
      'Customize your experience and preferences.',
    );
  });

  it('renders the settings sections in the navigation', async () => {
    await harness.navigateByUrl('/settings/general');

    expect(navLinks().map((link) => link.textContent.trim())).toEqual(['General', 'Account']);
    expect(navLinks().map((link) => link.getAttribute('href'))).toEqual([
      '/settings/general',
      '/settings/account',
    ]);
  });

  it('redirects the bare settings url to the general section', async () => {
    await harness.navigateByUrl('/settings');

    expect(element().querySelector('app-general-settings-page')).not.toBeNull();
    expect(activeLink()?.textContent.trim()).toBe('General');
  });

  it('marks the open section as the current page', async () => {
    await harness.navigateByUrl('/settings/account');

    expect(activeLink()?.textContent.trim()).toBe('Account');
    expect(activeLink()?.getAttribute('aria-current')).toBe('page');
    expect(element().querySelector('app-account-settings-page')).not.toBeNull();
    expect(element().querySelector('app-general-settings-page')).toBeNull();
  });

  it('switches sections from the navigation', async () => {
    await harness.navigateByUrl('/settings/general');

    navLinks()[1]!.click();
    await harness.fixture.whenStable();

    expect(element().querySelector('app-account-settings-page')).not.toBeNull();
    expect(activeLink()?.textContent.trim()).toBe('Account');
  });
});
