import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AuthStateService } from './auth-state.service';
import { Constants } from '../../../core/constants/constants';

const tokenWithExpiry = (expSeconds: number): string => {
  const payload: string = btoa(JSON.stringify({ exp: expSeconds }));
  return `${btoa(JSON.stringify({ alg: 'none' }))}.${payload}.signature`;
};

describe('AuthStateService', () => {
  describe('in the browser', () => {
    let service: AuthStateService;

    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [AuthStateService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });
      service = TestBed.inject(AuthStateService);
    });

    afterEach(() => {
      localStorage.clear();
      vi.useRealTimers();
    });

    it('returns null when nothing is stored', () => {
      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('persists the token under the application key', () => {
      service.setToken('abc');

      expect(localStorage.getItem(Constants.TOKEN_KEY)).toBe('abc');
      expect(service.getToken()).toBe('abc');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('removes the token', () => {
      service.setToken('abc');

      service.clearToken();

      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('reports an unexpired token as valid', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      service.setToken(tokenWithExpiry(Math.floor(Date.now() / 1000) + 3600));

      expect(service.isTokenValid()).toBe(true);
    });

    it('reports an expired token as invalid', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      service.setToken(tokenWithExpiry(Math.floor(Date.now() / 1000) - 1));

      expect(service.isTokenValid()).toBe(false);
    });

    it('reports a missing token as invalid', () => {
      expect(service.isTokenValid()).toBe(false);
    });

    it('reports an undecodable token as invalid instead of throwing', () => {
      service.setToken('not-a-jwt');

      expect(() => service.isTokenValid()).not.toThrow();
      expect(service.isTokenValid()).toBe(false);
    });
  });

  describe('on the server', () => {
    let service: AuthStateService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [AuthStateService, { provide: PLATFORM_ID, useValue: 'server' }],
      });
      service = TestBed.inject(AuthStateService);
    });

    it('never touches localStorage', () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      const getItem = vi.spyOn(Storage.prototype, 'getItem');
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem');

      service.setToken('abc');
      service.clearToken();

      expect(service.getToken()).toBeUndefined();
      expect(setItem).not.toHaveBeenCalled();
      expect(getItem).not.toHaveBeenCalled();
      expect(removeItem).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('treats the user as logged out', () => {
      expect(service.isLoggedIn()).toBe(false);
      expect(service.isTokenValid()).toBe(false);
    });
  });
});
