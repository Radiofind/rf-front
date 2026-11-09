import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { Constants } from '../../constants/constants';

describe('TokenStorageService', () => {
  const createService = (platform: string): TokenStorageService => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(TokenStorageService);
  };

  afterEach(() => {
    localStorage.clear();
  });

  it('reads nothing when no token is stored', () => {
    const service: TokenStorageService = createService('browser');

    expect(service.read()).toBeNull();
  });

  it('persists the token under the application key', () => {
    const service: TokenStorageService = createService('browser');

    service.write('abc');

    expect(localStorage.getItem(Constants.TOKEN_KEY)).toBe('abc');
  });

  it('reads the stored token', () => {
    localStorage.setItem(Constants.TOKEN_KEY, 'abc');
    const service: TokenStorageService = createService('browser');

    expect(service.read()).toBe('abc');
  });

  it('removes the stored token', () => {
    localStorage.setItem(Constants.TOKEN_KEY, 'abc');
    const service: TokenStorageService = createService('browser');

    service.clear();

    expect(localStorage.getItem(Constants.TOKEN_KEY)).toBeNull();
  });

  it('reads nothing on the server even when a token is stored', () => {
    localStorage.setItem(Constants.TOKEN_KEY, 'abc');
    const service: TokenStorageService = createService('server');

    expect(service.read()).toBeNull();
  });

  it('does not persist on the server', () => {
    const service: TokenStorageService = createService('server');

    service.write('abc');

    expect(localStorage.getItem(Constants.TOKEN_KEY)).toBeNull();
  });

  it('keeps the stored token when cleared on the server', () => {
    localStorage.setItem(Constants.TOKEN_KEY, 'abc');
    const service: TokenStorageService = createService('server');

    service.clear();

    expect(localStorage.getItem(Constants.TOKEN_KEY)).toBe('abc');
  });
});
