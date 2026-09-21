import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStateService } from '../../features/services/auth-state-service/auth-state.service';
import { Links } from '../constants/links';

import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let isTokenValid: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  const runGuard = (): boolean =>
    TestBed.runInInjectionContext(
      () =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean,
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

  it('allows access for a valid token', () => {
    isTokenValid.mockReturnValue(true);

    expect(runGuard()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('blocks access and redirects to login for an invalid token', () => {
    isTokenValid.mockReturnValue(false);

    expect(runGuard()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([Links.LOGIN_URL]);
  });

  it('defers the decision to the browser when rendering on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    isTokenValid.mockReturnValue(false);

    expect(runGuard()).toBe(true);
    expect(isTokenValid).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
