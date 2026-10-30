import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AccentThemeService } from './accent-theme.service';

describe('AccentThemeService', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
    document.head.querySelector('link[rel="icon"]')?.remove();
    localStorage.removeItem('radiofind_accent_theme');
  });

  it('switches the accent base colors to the selected accent', () => {
    TestBed.inject(AccentThemeService).apply('OCEAN');

    const style: CSSStyleDeclaration = document.documentElement.style;

    expect(style.getPropertyValue('--main-color')).toBe('#0284c7');
    expect(style.getPropertyValue('--first-gradient-color')).toBe('#0ea5e9');
    expect(style.getPropertyValue('--second-gradient-color')).toBe('#22d3ee');
  });

  it('rotates the artwork hue towards the selected accent', () => {
    TestBed.inject(AccentThemeService).apply('OCEAN');

    expect(document.documentElement.style.getPropertyValue('--accent-hue-shift')).toBe('-63deg');
  });

  it('keeps the artwork hue for the accent it is drawn in', () => {
    TestBed.inject(AccentThemeService).apply('VIOLET');

    expect(document.documentElement.style.getPropertyValue('--accent-hue-shift')).toBe('0deg');
  });

  it('replaces the favicon with one painted in the selected accent', () => {
    const favicon: HTMLLinkElement = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'favicon.ico';
    document.head.appendChild(favicon);

    TestBed.inject(AccentThemeService).apply('OCEAN');

    expect(favicon.type).toBe('image/svg+xml');
    expect(decodeURIComponent(favicon.href)).toContain('stop-color="#22d3ee"');
  });

  it('remembers the accent on the device with the properties to paint before startup', () => {
    TestBed.inject(AccentThemeService).apply('OCEAN');

    expect(JSON.parse(localStorage.getItem('radiofind_accent_theme') ?? 'null')).toEqual({
      accentColor: 'OCEAN',
      properties: {
        '--first-gradient-color': '#0ea5e9',
        '--second-gradient-color': '#22d3ee',
        '--main-color': '#0284c7',
        '--accent-hue-shift': '-63deg',
      },
    });
  });

  it('restores the accent remembered on the device at startup', () => {
    localStorage.setItem('radiofind_accent_theme', JSON.stringify({ accentColor: 'PLUM' }));
    const service: AccentThemeService = TestBed.inject(AccentThemeService);

    service.init();

    expect(service.accentColor()).toBe('PLUM');
    expect(document.documentElement.style.getPropertyValue('--main-color')).toBe('#6b21a8');
  });

  it('starts with the default accent when the remembered one is unknown', () => {
    localStorage.setItem('radiofind_accent_theme', JSON.stringify({ accentColor: 'NEON' }));
    const service: AccentThemeService = TestBed.inject(AccentThemeService);

    service.init();

    expect(service.accentColor()).toBe('VIOLET');
  });

  it('starts with the default accent when the remembered value is corrupted', () => {
    localStorage.setItem('radiofind_accent_theme', '{not json');
    const service: AccentThemeService = TestBed.inject(AccentThemeService);

    service.init();

    expect(service.accentColor()).toBe('VIOLET');
  });

  it('leaves the document untouched during server-side rendering', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    TestBed.inject(AccentThemeService).init();

    expect(document.documentElement.style.getPropertyValue('--main-color')).toBe('');
  });
});
