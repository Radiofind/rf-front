import { describe, expect, it } from 'vitest';
import { MAIN_ROUTES } from './main.routes';
import { Links } from '../../core/constants/links';

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
  ])('lazy loads the component for %s', async (path) => {
    const route: Route = routeFor(path);

    expect(route.loadComponent).toBeTypeOf('function');
    await expect(route.loadComponent?.()).resolves.toBeTypeOf('function');
  });
});
