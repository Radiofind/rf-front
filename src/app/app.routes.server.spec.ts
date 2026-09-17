import { describe, expect, it } from 'vitest';
import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { Links } from './core/constants/links';

describe('serverRoutes', () => {
  it('prerenders every route', () => {
    expect(serverRoutes).toEqual([{ path: Links.WILDCARD_PATH, renderMode: RenderMode.Prerender }]);
  });
});
