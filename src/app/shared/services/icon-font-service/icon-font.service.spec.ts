import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { IconFontService } from './icon-font.service';
import { LoaderService } from '../loader-service/loader.service';

describe('IconFontService', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'fonts');
    vi.useRealTimers();
  });

  it('shows the global loader while the icon fonts are loading', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: vi.fn(() => new Promise(() => undefined)) },
    });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });

    TestBed.inject(IconFontService).init();

    expect(TestBed.inject(LoaderService).isLoading()).toBe(true);
  });

  it('hides the global loader once the icon fonts are loaded', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: vi.fn(() => Promise.resolve([])) },
    });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });

    TestBed.inject(IconFontService).init();
    await vi.waitFor(() => {
      expect(TestBed.inject(LoaderService).isLoading()).toBe(false);
    });
  });

  it('hides the global loader when an icon font fails to load', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: vi.fn(() => Promise.reject(new Error('network'))) },
    });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });

    TestBed.inject(IconFontService).init();
    await vi.waitFor(() => {
      expect(TestBed.inject(LoaderService).isLoading()).toBe(false);
    });
  });

  it('hides the global loader after ten seconds when the icon fonts hang', async () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: vi.fn(() => new Promise(() => undefined)) },
    });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });

    TestBed.inject(IconFontService).init();
    await vi.advanceTimersByTimeAsync(10000);

    expect(TestBed.inject(LoaderService).isLoading()).toBe(false);
  });

  it('requests every boxicons family', () => {
    const load = vi.fn(() => new Promise(() => undefined));
    Object.defineProperty(document, 'fonts', { configurable: true, value: { load } });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });

    TestBed.inject(IconFontService).init();

    expect(load.mock.calls).toEqual([
      ['1em "boxicons"'],
      ['1em "boxicons-filled"'],
      ['1em "boxicons-brands"'],
    ]);
  });

  it('leaves the global loader idle when rendering on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    TestBed.inject(IconFontService).init();

    expect(TestBed.inject(LoaderService).isLoading()).toBe(false);
  });
});
