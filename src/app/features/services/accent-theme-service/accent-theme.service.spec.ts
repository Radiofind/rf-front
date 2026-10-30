import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccentThemeService } from './accent-theme.service';

describe('AccentThemeService', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
    document.head.querySelector('link[rel="icon"]')?.remove();
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
});
