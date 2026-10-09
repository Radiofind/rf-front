import { describe, expect, it } from 'vitest';
import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { Links } from './core/constants/links';

import type { ServerRoute } from '@angular/ssr';

describe('serverRoutes', () => {
  const routeFor = (path: string): ServerRoute => {
    const route: ServerRoute | undefined = serverRoutes.find(
      (candidate) => candidate.path === path,
    );

    expect(route, `no server route registered for "${path}"`).toBeDefined();

    return route!;
  };

  it.each([
    Links.DEFAULT_PATH,
    Links.MEDIA_LIBRARY_URL,
    Links.UPLOAD_TRACK_URL,
    Links.MY_UPLOADS_URL,
    Links.STATISTICS_URL,
    Links.SUPPORT_URL,
    Links.PROFILE_URL,
  ])('renders %s on the client only', (path) => {
    expect(routeFor(path).renderMode).toBe(RenderMode.Client);
  });

  it('prerenders everything else', () => {
    expect(serverRoutes[serverRoutes.length - 1]).toEqual({
      path: Links.WILDCARD_PATH,
      renderMode: RenderMode.Prerender,
    });
  });
});
