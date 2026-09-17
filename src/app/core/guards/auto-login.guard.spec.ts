import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
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

  it('redirects an already authenticated user to the uploads page', () => {
    isTokenValid.mockReturnValue(true);

    expect(runGuard()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([Links.UPLOADS_URL]);
  });
});
