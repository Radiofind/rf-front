import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { noLoginGuard } from './auto-login.guard';
import { AuthStateService } from '../../features/services/auth-state-service/auth-state.service';
import { Links } from '../constants/links';

import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('noLoginGuard', () => {
  let isTokenValid: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  const runGuard = (): boolean =>
    TestBed.runInInjectionContext(
      () =>
        noLoginGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean,
    );

  beforeEach(() => {
    isTokenValid = vi.fn();
    navigate = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: { isTokenValid: isTokenValid } },
        { provide: Router, useValue: { navigate: navigate } },
      ],
    });
  });

  it('lets an anonymous visitor reach the auth page', () => {
    isTokenValid.mockReturnValue(false);

    expect(runGuard()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects an already authenticated user to the main shell', () => {
    isTokenValid.mockReturnValue(true);

    expect(runGuard()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([Links.DEFAULT_PATH]);
  });

  it('defers the decision to the browser when rendering on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    isTokenValid.mockReturnValue(true);

    expect(runGuard()).toBe(true);
    expect(isTokenValid).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
