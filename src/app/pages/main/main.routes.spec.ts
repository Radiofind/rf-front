import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MAIN_ROUTES } from './main.routes';
import { Links } from '../../core/constants/links';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes/unsaved-changes.guard';
import { ProfilePageComponent } from './profile-page/profile-page/profile-page.component';
import { EditProfilePageComponent } from './profile-page/edit-profile-page/edit-profile-page.component';

import type { Route } from '@angular/router';

describe('MAIN_ROUTES', () => {
  const routeFor = (path: string): Route => {
    const route: Route | undefined = MAIN_ROUTES.find((candidate) => candidate.path === path);

    expect(route, `no route registered for "${path}"`).toBeDefined();

    return route!;
  };

  it('sends the empty path to the media library', () => {
    const route: Route = routeFor(Links.DEFAULT_PATH);

    expect(route.redirectTo).toBe(Links.MEDIA_LIBRARY_URL);
    expect(route.pathMatch).toBe('full');
  });

  it.each([
    Links.MEDIA_LIBRARY_URL,
    Links.UPLOAD_TRACK_URL,
    Links.MY_UPLOADS_URL,
    Links.STATISTICS_URL,
    Links.SUPPORT_URL,
    Links.PROFILE_URL,
    Links.EDIT_PROFILE_URL,
  ])('lazy loads the component for %s', async (path) => {
    const route: Route = routeFor(path);

    expect(route.loadComponent).toBeTypeOf('function');
    await expect(route.loadComponent?.()).resolves.toBeTypeOf('function');
  });

  it('keeps the profile view and the profile editor on separate pages', async () => {
    await expect(routeFor(Links.PROFILE_URL).loadComponent?.()).resolves.toBe(ProfilePageComponent);
    await expect(routeFor(Links.EDIT_PROFILE_URL).loadComponent?.()).resolves.toBe(
      EditProfilePageComponent,
    );
  });

  it('guards the profile editor against losing unsaved changes', () => {
    expect(routeFor(Links.EDIT_PROFILE_URL).canDeactivate).toEqual([unsavedChangesGuard]);
  });

  it('nests the profile editor under the profile url', () => {
    expect(Links.EDIT_PROFILE_URL).toBe(`${Links.PROFILE_URL}/edit`);
  });

  it('opens the profile editor rather than the profile view for the edit url', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(MAIN_ROUTES)] });

    const harness: RouterTestingHarness = await RouterTestingHarness.create();

    await expect(
      harness.navigateByUrl(`/${Links.EDIT_PROFILE_URL}`, EditProfilePageComponent),
    ).resolves.toBeInstanceOf(EditProfilePageComponent);
    expect(harness.routeNativeElement?.querySelector('app-profile-page')).toBeNull();
  });

  it('lazy loads the settings layout together with its child routes', async () => {
    const route: Route = routeFor(Links.SETTINGS_URL);

    await expect(route.loadComponent?.()).resolves.toBeTypeOf('function');
    await expect(route.loadChildren?.()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ path: Links.GENERAL_SETTINGS_PATH })]),
    );
  });
});
