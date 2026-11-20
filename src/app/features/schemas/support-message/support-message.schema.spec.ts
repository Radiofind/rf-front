import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { supportMessageFormSchema } from './support-message.schema';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';

import type { WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { ISupportMessageForm } from '../../models/support.model';

describe('supportMessageFormSchema', () => {
  const buildForm = (subject: string, message: string): FieldTree<ISupportMessageForm> => {
    const model: WritableSignal<ISupportMessageForm> = signal<ISupportMessageForm>({
      subject: subject,
      message: message,
    });

    return TestBed.runInInjectionContext(() =>
      form<ISupportMessageForm>(model, supportMessageFormSchema),
    );
  };

  it('requires a subject', () => {
    const tree: FieldTree<ISupportMessageForm> = buildForm('', 'My track stays in review');

    expect(
      tree
        .subject()
        .errors()
        .map((error) => error.message),
    ).toEqual([AuthValidationMessages.REQUIRED]);
  });

  it('requires a message', () => {
    const tree: FieldTree<ISupportMessageForm> = buildForm('Upload stuck', '');

    expect(
      tree
        .message()
        .errors()
        .map((error) => error.message),
    ).toEqual([AuthValidationMessages.REQUIRED]);
  });

  it('limits the subject to 150 characters', () => {
    const tree: FieldTree<ISupportMessageForm> = buildForm('a'.repeat(151), 'Help');

    expect(
      tree
        .subject()
        .errors()
        .map((error) => error.message),
    ).toEqual(['validation.maxLengthTitle']);
  });

  it('limits the message to 2000 characters', () => {
    const tree: FieldTree<ISupportMessageForm> = buildForm('Upload stuck', 'a'.repeat(2001));

    expect(
      tree
        .message()
        .errors()
        .map((error) => error.message),
    ).toEqual(['validation.maxLengthSupportMessage']);
  });

  it('accepts a complete message', () => {
    const tree: FieldTree<ISupportMessageForm> = buildForm('Upload stuck', 'Help');

    expect(tree().valid()).toBe(true);
  });
});
