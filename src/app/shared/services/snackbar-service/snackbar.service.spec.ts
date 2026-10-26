import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SnackbarService } from './snackbar.service';
import { Constants } from '../../../core/constants/constants';
import { SnackbarTypeEnum } from '../../../core/enums/snackbar-type.enum';

import type { TranslationKey } from '../../../core/types/translation.type';
import type { ISnackbarMessage } from '../../models/snackbar.model';

describe('SnackbarService', () => {
  let service: SnackbarService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [SnackbarService] });
    service = TestBed.inject(SnackbarService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no messages', () => {
    expect(service.messages()).toEqual([]);
  });

  it('shows a success message by default and returns its id', () => {
    const id: number = service.show('messages.settingsSaved');
    const [message]: readonly ISnackbarMessage[] = service.messages();

    expect(id).toBe(1);
    expect(message).toEqual({
      id: 1,
      content: 'messages.settingsSaved',
      params: null,
      type: SnackbarTypeEnum.SUCCESS,
      iconClass: null,
    });
  });

  it('hands out increasing ids', () => {
    expect(service.show('messages.avatarUpdated')).toBe(1);
    expect(service.show('messages.avatarRemoved')).toBe(2);
  });

  it('keeps translation params', () => {
    service.show('avatar.tooLarge', { params: { size: 5 } });

    expect(service.messages()[0]?.params).toEqual({ size: 5 });
  });

  it('keeps a custom icon class', () => {
    service.show('messages.settingsSaved', { iconClass: 'bx bx-custom' });

    expect(service.messages()[0]?.iconClass).toBe('bx bx-custom');
  });

  it.each([
    ['success' as const, SnackbarTypeEnum.SUCCESS],
    ['error' as const, SnackbarTypeEnum.ERROR],
    ['warning' as const, SnackbarTypeEnum.WARNING],
    ['info' as const, SnackbarTypeEnum.INFO],
  ])('%s() tags the message with its type', (method, expectedType) => {
    service[method]('messages.emailSent');

    expect(service.messages()[0]?.type).toBe(expectedType);
  });

  it('auto-dismisses a message after the default duration', () => {
    service.show('messages.settingsSaved');

    vi.advanceTimersByTime(Constants.SNACKBAR_DURATION_MS - 1);
    expect(service.messages()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.messages()).toEqual([]);
  });

  it('honours a custom duration', () => {
    service.show('messages.settingsSaved', { duration: 5000 });

    vi.advanceTimersByTime(Constants.SNACKBAR_DURATION_MS);
    expect(service.messages()).toHaveLength(1);

    vi.advanceTimersByTime(3000);
    expect(service.messages()).toEqual([]);
  });

  it('keeps a message forever when the duration is zero or negative', () => {
    service.show('messages.passwordReset', { duration: 0 });

    vi.advanceTimersByTime(60_000);

    expect(service.messages()).toHaveLength(1);
  });

  it('dismisses a message by id', () => {
    const first: number = service.show('messages.avatarUpdated');
    service.show('messages.avatarRemoved');

    service.dismiss(first);

    expect(service.messages().map((message) => message.content)).toEqual([
      'messages.avatarRemoved',
    ]);
  });

  it('ignores dismissing an unknown id', () => {
    service.show('messages.avatarUpdated');

    service.dismiss(999);

    expect(service.messages()).toHaveLength(1);
  });

  it('drops the oldest message once the stack overflows', () => {
    const keys: readonly TranslationKey[] = [
      'messages.avatarUpdated',
      'messages.avatarRemoved',
      'messages.emailSent',
    ];

    keys.slice(0, Constants.SNACKBAR_MAX_STACK).forEach((key: TranslationKey) => {
      service.show(key);
    });

    expect(service.messages()).toHaveLength(Constants.SNACKBAR_MAX_STACK);

    service.show('messages.passwordReset');

    expect(service.messages().map((message) => message.content)).toEqual([
      'messages.avatarRemoved',
      'messages.emailSent',
      'messages.passwordReset',
    ]);
  });

  it('clears every message and its timer', () => {
    service.show('messages.avatarUpdated');
    service.show('messages.avatarRemoved');

    service.clear();
    expect(service.messages()).toEqual([]);

    vi.advanceTimersByTime(Constants.SNACKBAR_DURATION_MS);
    expect(service.messages()).toEqual([]);
  });

  it('clears everything when the injector is destroyed', () => {
    service.show('messages.avatarUpdated');

    TestBed.resetTestingModule();

    expect(service.messages()).toEqual([]);
  });
});
