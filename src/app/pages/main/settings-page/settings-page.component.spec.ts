import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SettingsPageComponent } from './settings-page.component';
import { SETTINGS_ROUTES } from './settings.routes';
import { SettingsStateService } from '../../../features/services/settings-state-service/settings-state.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { DEFAULT_GENERAL_SETTINGS } from '../../../features/constants/settings.constant';
import { Links } from '../../../core/constants/links';

describe('SettingsPageComponent', () => {
  let harness: RouterTestingHarness;

  const element = (): HTMLElement => harness.routeNativeElement!;

  const navLinks = (): HTMLAnchorElement[] =>
    Array.from(element().querySelectorAll<HTMLAnchorElement>('.settings__nav-item'));

  const activeLink = (): HTMLAnchorElement | null =>
    element().querySelector<HTMLAnchorElement>('.settings__nav-item--active');

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
        {
          provide: SettingsStateService,
          useValue: {
            settings: signal(DEFAULT_GENERAL_SETTINGS).asReadonly(),
            isLoaded: signal(true).asReadonly(),
            loadSettings: vi.fn().mockResolvedValue(true),
            updateSettings: vi.fn().mockResolvedValue(undefined),
          },
        },
        { provide: SnackbarService, useValue: { error: vi.fn(), success: vi.fn() } },
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
