import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { authGuard } from './auth.guard';
import { Links } from '../../constants/links';

import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  const validToken: string = 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDB9.signature';
  const expiredToken: string = 'eyJhbGciOiJub25lIn0.eyJleHAiOjEwMDAwMDAwMDB9.signature';

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
      () => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean,
    );

  beforeEach(() => {
    navigate = vi.fn().mockResolvedValue(true);
  });

  it('allows access for a valid token', () => {
    configure(validToken);

    expect(runGuard()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('blocks access and redirects to login for an expired token', () => {
    configure(expiredToken);

    expect(runGuard()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([Links.LOGIN_URL]);
  });

  it('blocks access and redirects to login without a token', () => {
    configure(null);

    expect(runGuard()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([Links.LOGIN_URL]);
  });

  it('defers the decision to the browser when rendering on the server', () => {
    configure(null, 'server');

    expect(runGuard()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });
});
