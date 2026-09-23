import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SnackbarService } from './snackbar.service';
import { Constants } from '../../../core/constants/constants';
import { SnackbarTypeEnum } from '../../../core/enums/snackbar-type.enum';

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
    const id: number = service.show('Saved');
    const [message]: readonly ISnackbarMessage[] = service.messages();

    expect(id).toBe(1);
    expect(message).toEqual({
      id: 1,
      content: 'Saved',
      type: SnackbarTypeEnum.SUCCESS,
      iconClass: null,
    });
  });

  it('hands out increasing ids', () => {
    expect(service.show('first')).toBe(1);
    expect(service.show('second')).toBe(2);
  });

  it('keeps a custom icon class', () => {
    service.show('Saved', { iconClass: 'bx bx-custom' });

    expect(service.messages()[0]?.iconClass).toBe('bx bx-custom');
  });

  it.each([
    ['success' as const, SnackbarTypeEnum.SUCCESS],
    ['error' as const, SnackbarTypeEnum.ERROR],
    ['warning' as const, SnackbarTypeEnum.WARNING],
    ['info' as const, SnackbarTypeEnum.INFO],
  ])('%s() tags the message with its type', (method, expectedType) => {
    service[method]('message');

    expect(service.messages()[0]?.type).toBe(expectedType);
  });

  it('auto-dismisses a message after the default duration', () => {
    service.show('Saved');

    vi.advanceTimersByTime(Constants.SNACKBAR_DURATION_MS - 1);
    expect(service.messages()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.messages()).toEqual([]);
  });

  it('honours a custom duration', () => {
    service.show('Saved', { duration: 5000 });

    vi.advanceTimersByTime(Constants.SNACKBAR_DURATION_MS);
    expect(service.messages()).toHaveLength(1);

    vi.advanceTimersByTime(3000);
    expect(service.messages()).toEqual([]);
  });

  it('keeps a message forever when the duration is zero or negative', () => {
    service.show('Sticky', { duration: 0 });

    vi.advanceTimersByTime(60_000);

    expect(service.messages()).toHaveLength(1);
  });

  it('dismisses a message by id', () => {
    const first: number = service.show('first');
    service.show('second');

    service.dismiss(first);

    expect(service.messages().map((message) => message.content)).toEqual(['second']);
  });

  it('ignores dismissing an unknown id', () => {
    service.show('first');

    service.dismiss(999);

    expect(service.messages()).toHaveLength(1);
  });

  it('drops the oldest message once the stack overflows', () => {
    for (let index: number = 1; index <= Constants.SNACKBAR_MAX_STACK; index++) {
      service.show(`message ${String(index)}`);
    }

    expect(service.messages()).toHaveLength(Constants.SNACKBAR_MAX_STACK);

    service.show('newest');

    expect(service.messages().map((message) => message.content)).toEqual([
      'message 2',
      'message 3',
      'newest',
    ]);
  });

  it('clears every message and its timer', () => {
    service.show('first');
    service.show('second');

    service.clear();
    expect(service.messages()).toEqual([]);

    vi.advanceTimersByTime(Constants.SNACKBAR_DURATION_MS);
    expect(service.messages()).toEqual([]);
  });

  it('clears everything when the injector is destroyed', () => {
    service.show('first');

    TestBed.resetTestingModule();

    expect(service.messages()).toEqual([]);
  });
});
