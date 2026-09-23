import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';
import { noLoginGuard } from './core/guards/auto-login.guard';
import { Constants } from './core/constants/constants';
import { Links } from './core/constants/links';
import { ErrorTypeEnum } from './core/enums/error-type.enum';

import type { Route } from '@angular/router';

describe('routes', () => {
  const routeFor = (path: string): Route => {
    const route: Route | undefined = routes.find((candidate) => candidate.path === path);

    expect(route, `no route registered for "${path}"`).toBeDefined();

    return route!;
  };

  it('protects the main shell and lazy loads its children', async () => {
    const route: Route = routeFor(Links.DEFAULT_PATH);

    expect(route.canActivate).toEqual([authGuard]);
    expect(route.loadComponent).toBeTypeOf('function');
    await expect(route.loadComponent?.()).resolves.toBeTypeOf('function');
    expect(route.loadChildren).toBeTypeOf('function');
  });

  it('keeps authenticated users away from the login page', () => {
    expect(routeFor(Links.LOGIN_URL).canActivate).toEqual([noLoginGuard]);
  });

  it('leaves the register page open', () => {
    expect(routeFor(Links.REGISTER_URL).canActivate).toBeUndefined();
  });

  it.each([
    [Links.LOGIN_URL, Constants.LOGIN],
    [Links.REGISTER_URL, Constants.REGISTER],
  ])('passes the auth type to %s', (path, authType) => {
    expect(routeFor(path).data?.[Constants.AUTH_TYPE_PROP]).toBe(authType);
  });

  it.each([
    [Links.FORBIDDEN_URL, ErrorTypeEnum.FORBIDDEN],
    [Links.SERVER_ERROR_URL, ErrorTypeEnum.SERVER_ERROR],
    [Links.NOT_FOUND_URL, ErrorTypeEnum.NOT_FOUND],
    [Links.WILDCARD_PATH, ErrorTypeEnum.NOT_FOUND],
  ])('passes the error type to %s', (path, errorType) => {
    expect(routeFor(path).data?.[Constants.ERROR_TYPE_PROP]).toBe(errorType);
  });

  it('catches unknown urls last', () => {
    expect(routes[routes.length - 1]?.path).toBe(Links.WILDCARD_PATH);
  });

  it.each([
    Links.LOGIN_URL,
    Links.REGISTER_URL,
    Links.RESET_PASSWORD_URL,
    Links.FORBIDDEN_URL,
    Links.SERVER_ERROR_URL,
    Links.NOT_FOUND_URL,
    Links.WILDCARD_PATH,
  ])('lazy loads the component for %s', async (path) => {
    const route: Route = routeFor(path);

    expect(route.loadComponent).toBeTypeOf('function');
    await expect(route.loadComponent?.()).resolves.toBeTypeOf('function');
  });
});
