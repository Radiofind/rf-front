import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClient, HttpBackend, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { appConfig } from './app.config';
import { config as serverConfig } from './app.config.server';
import { routes } from './app.routes';
import { AuthStateService } from './features/services/auth-state-service/auth-state.service';
import { LoaderService } from './shared/services/loader-service/loader.service';
import { Constants } from './core/constants/constants';
import { environment } from '../environments/environment';

import type { HttpEvent, HttpRequest } from '@angular/common/http';
import type { Observable } from 'rxjs';

class RecordingBackend implements HttpBackend {
  public lastRequest?: HttpRequest<unknown>;

  public handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.lastRequest = request;
    return of(new HttpResponse());
  }
}

describe('appConfig', () => {
  let backend: RecordingBackend;

  beforeEach(() => {
    backend = new RecordingBackend();

    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: HttpBackend, useValue: backend },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  it('registers the application routes', () => {
    expect(TestBed.inject(Router).config).toEqual(routes);
  });

  it('provides a working http client', () => {
    expect(TestBed.inject(HttpClient)).toBeInstanceOf(HttpClient);
  });

  it('runs the auth interceptor on outgoing requests', () => {
    localStorage.setItem(Constants.TOKEN_KEY, 'jwt');
    TestBed.inject(AuthStateService);

    TestBed.inject(HttpClient).get(`${environment.apiUrl}/tracks`).subscribe();

    expect(backend.lastRequest?.headers.get('Authorization')).toBe(`${Constants.BEARER} jwt`);
    localStorage.clear();
  });

  it('runs the loader interceptor on outgoing requests', () => {
    const loaderService: LoaderService = TestBed.inject(LoaderService);

    TestBed.inject(HttpClient).get(`${environment.apiUrl}/tracks`).subscribe();

    expect(loaderService.isLoading()).toBe(false);
    expect(backend.lastRequest).toBeDefined();
  });
});

describe('server config', () => {
  it('keeps every browser provider and adds the server ones on top', () => {
    expect(serverConfig.providers.length).toBeGreaterThan(appConfig.providers.length);
    appConfig.providers.forEach((provider) => {
      expect(serverConfig.providers).toContain(provider);
    });
  });
});
