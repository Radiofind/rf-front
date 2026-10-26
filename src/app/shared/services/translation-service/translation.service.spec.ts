import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslationService } from './translation.service';
import { Constants } from '../../../core/constants/constants';
import { GENRE_OPTIONS } from '../../../features/constants/edit-profile.constant';

describe('TranslationService', () => {
  let service: TranslationService;

  const createService = (platform: string = 'browser'): void => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });
    service = TestBed.inject(TranslationService);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('lang');
    localStorage.clear();
  });

  it('speaks English before any language is chosen', () => {
    createService();

    expect(service.language()).toBe('EN');
    expect(service.locale()).toBe('en-US');
    expect(service.translate('common.save')).toBe('Save');
  });

  it('interpolates params', () => {
    createService();

    expect(service.translate('avatar.tooLarge', { size: 5 })).toBe('Image must not exceed 5 MB');
  });

  it('switches the whole dictionary, the document language and the title', async () => {
    createService();

    await service.use('RU');

    expect(service.language()).toBe('RU');
    expect(service.locale()).toBe('ru-RU');
    expect(service.translate('common.save')).toBe('Сохранить');
    expect(document.documentElement.lang).toBe('ru');
    expect(TestBed.inject(Title).getTitle()).toBe(service.translate('app.title'));
  });

  it('remembers the chosen language on the device', async () => {
    createService();

    await service.use('DE');

    expect(localStorage.getItem(Constants.LANGUAGE_KEY)).toBe('DE');
  });

  it('starts in the language stored on the device', async () => {
    localStorage.setItem(Constants.LANGUAGE_KEY, 'FR');
    createService();

    await service.init();

    expect(service.language()).toBe('FR');
  });

  it('ignores an unknown stored language', async () => {
    localStorage.setItem(Constants.LANGUAGE_KEY, 'XX');
    createService();

    await service.init();

    expect(service.language()).toBe('EN');
  });

  it('keeps the last requested language when switches overlap', async () => {
    createService();

    const first: Promise<void> = service.use('DE');
    const second: Promise<void> = service.use('IT');
    await Promise.all([first, second]);

    expect(service.language()).toBe('IT');
  });

  it('does not touch storage on the server', async () => {
    createService('server');

    await service.use('ES');

    expect(service.language()).toBe('ES');
    expect(localStorage.getItem(Constants.LANGUAGE_KEY)).toBeNull();
  });

  it('translates option labels', async () => {
    createService();
    await service.use('RU');

    expect(service.translateOptions(GENRE_OPTIONS.slice(0, 1))).toEqual([
      { value: 'ALTERNATIVE', label: 'Альтернатива', children: undefined },
    ]);
  });

  it('formats relative time in the active locale', async () => {
    createService();
    await service.use('RU');

    expect(service.formatRelativeTime(-2, 'day')).toBe('позавчера');
    expect(service.formatRelativeTime(-5, 'day')).toBe('5 дней назад');
  });
});
