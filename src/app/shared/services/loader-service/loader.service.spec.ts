import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoaderService] });
    service = TestBed.inject(LoaderService);
  });

  it('is idle initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('is loading after show()', () => {
    service.show();

    expect(service.isLoading()).toBe(true);
  });

  it('stays loading until every concurrent request finished', () => {
    service.show();
    service.show();

    service.hide();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('never drops the counter below zero', () => {
    service.hide();
    expect(service.isLoading()).toBe(false);

    service.show();
    expect(service.isLoading()).toBe(true);
  });
});
