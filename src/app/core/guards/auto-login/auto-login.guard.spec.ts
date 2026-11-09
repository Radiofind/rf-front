import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { noLoginGuard } from './auto-login.guard';
import { Links } from '../../constants/links';

import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('noLoginGuard', () => {
  const validToken: string = 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

  let navigate: ReturnType<typeof vi.fn>;

  const configure = (token: string | null, platform: string = 'browser'): void => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: { auth: { token: token } } }),
        { provide: Router, useValue: { navigate: navigate } },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
  };

  const runGuard = (): boolean =>
    TestBed.runInInjectionContext(
      () => noLoginGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean,
    );

  beforeEach(() => {
    navigate = vi.fn().mockResolvedValue(true);
  });

  it('lets an anonymous visitor reach the auth page', () => {
    configure(null);

    expect(runGuard()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects an already authenticated user to the main shell', () => {
    configure(validToken);

    expect(runGuard()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([Links.DEFAULT_PATH]);
  });

  it('defers the decision to the browser when rendering on the server', () => {
    configure(validToken, 'server');

    expect(runGuard()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });
});
