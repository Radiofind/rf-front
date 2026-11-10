import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { UploadsPreferencesService } from './uploads-preferences.service';

describe('UploadsPreferencesService', () => {
  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('reads back a saved page size', () => {
    const service: UploadsPreferencesService = TestBed.inject(UploadsPreferencesService);

    service.writePageSize(50);

    expect(service.readPageSize()).toBe(50);
  });

  it.each([['7'], ['abc'], ['']])(
    'ignores the stored page size %j it does not offer',
    (stored: string) => {
      localStorage.setItem('radiofind_uploads_page_size', stored);

      expect(TestBed.inject(UploadsPreferencesService).readPageSize()).toBeNull();
    },
  );

  it('remembers nothing during server rendering', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service: UploadsPreferencesService = TestBed.inject(UploadsPreferencesService);

    service.writePageSize(50);

    expect(localStorage.getItem('radiofind_uploads_page_size')).toBeNull();
    expect(service.readPageSize()).toBeNull();
  });
});
