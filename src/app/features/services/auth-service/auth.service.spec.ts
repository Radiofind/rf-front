import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../auth-state-service/auth-state.service';

import type { Observable } from 'rxjs';
import type { IAuthResponse } from '../../../core/models/auth.model';
import type { IRegisterData } from '../../models/auth-content.model';

describe('AuthService', () => {
  const authResponse: IAuthResponse = { challengeId: null, requiresTwoFactor: false, token: 'jwt' };

  const registerData: IRegisterData = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    dateOfBirth: new Date(1994, 2, 7),
    password: 'Passw0rd!',
  };

  let service: AuthService;
  let apiMock: Record<string, ReturnType<typeof vi.fn>>;
  let clearToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const authResponse$: Observable<IAuthResponse> = of(authResponse);

    apiMock = {
      register: vi.fn().mockReturnValue(authResponse$),
      login: vi.fn().mockReturnValue(authResponse$),
      twoFactorAuth: vi.fn().mockReturnValue(authResponse$),
      resendTwoFactorAuth: vi.fn().mockReturnValue(authResponse$),
      forgetPassword: vi.fn().mockReturnValue(of({})),
      resetTokenValidation: vi.fn().mockReturnValue(of({ valid: true })),
      resetPassword: vi.fn().mockReturnValue(of({})),
    };

    clearToken = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiMock },
        { provide: AuthStateService, useValue: { clearToken: clearToken } },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('delegates register to the api service', () => {
    let received: IAuthResponse | undefined;

    service.register(registerData).subscribe(value => {
      received = value;
    });

    expect(apiMock['register']).toHaveBeenCalledWith(registerData);
    expect(received).toEqual(authResponse);
  });

  it('delegates login to the api service', () => {
    const credentials = { email: 'ada@example.com', password: 'Passw0rd!' };

    service.login(credentials).subscribe();

    expect(apiMock['login']).toHaveBeenCalledWith(credentials);
  });

  it('delegates two-factor verification to the api service', () => {
    const twoFactorData = { challengeId: 'challenge', code: '123456' };

    service.twoFactorAuth(twoFactorData).subscribe();

    expect(apiMock['twoFactorAuth']).toHaveBeenCalledWith(twoFactorData);
  });

  it('delegates resending the two-factor code to the api service', () => {
    service.resendTwoFactorAuth({ challengeId: 'challenge' }).subscribe();

    expect(apiMock['resendTwoFactorAuth']).toHaveBeenCalledWith({ challengeId: 'challenge' });
  });

  it('delegates the forgot-password request to the api service', () => {
    service.forgetPassword({ email: 'ada@example.com' }).subscribe();

    expect(apiMock['forgetPassword']).toHaveBeenCalledWith({ email: 'ada@example.com' });
  });

  it('delegates reset token validation to the api service', () => {
    let valid: boolean | undefined;

    service.resetTokenValidation({ token: 'reset-token' }).subscribe(value => {
      valid = value.valid;
    });

    expect(apiMock['resetTokenValidation']).toHaveBeenCalledWith({ token: 'reset-token' });
    expect(valid).toBe(true);
  });

  it('delegates the password reset to the api service', () => {
    service.resetPassword({ token: 'reset-token', newPassword: 'Passw0rd!' }).subscribe();

    expect(apiMock['resetPassword']).toHaveBeenCalledWith({
      token: 'reset-token',
      newPassword: 'Passw0rd!',
    });
  });

  it('clears the stored token on logout', () => {
    service.logout();

    expect(clearToken).toHaveBeenCalledTimes(1);
  });
});
