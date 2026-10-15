import { describe, expect, it } from 'vitest';
import { SETTINGS_ROUTES } from './settings.routes';
import { Links } from '../../../core/constants/links';

import type { Route } from '@angular/router';

describe('SETTINGS_ROUTES', () => {
  const routeFor = (path: string): Route => {
    const route: Route | undefined = SETTINGS_ROUTES.find((candidate) => candidate.path === path);

    expect(route, `no route registered for "${path}"`).toBeDefined();

    return route!;
  };

  it('opens the general settings by default', () => {
    const route: Route = routeFor(Links.DEFAULT_PATH);

    expect(route.redirectTo).toBe(Links.GENERAL_SETTINGS_PATH);
    expect(route.pathMatch).toBe('full');
  });

  it.each([Links.GENERAL_SETTINGS_PATH, Links.ACCOUNT_SETTINGS_PATH])(
    'lazy loads the component for %s',
    async (path) => {
      const route: Route = routeFor(path);

      await expect(route.loadComponent?.()).resolves.toBeTypeOf('function');
    },
  );

  it('keeps the full urls in sync with the route paths', () => {
    expect(Links.GENERAL_SETTINGS_URL).toBe('settings/general');
    expect(Links.ACCOUNT_SETTINGS_URL).toBe('settings/account');
  });
});
