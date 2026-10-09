import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { forgetPasswordSchema } from './forget-password.schema';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';

import type { WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IForgetPasswordForm } from '../../models/forget-password.model';

describe('forgetPasswordSchema', () => {
  const buildForm = (email: string): FieldTree<IForgetPasswordForm> => {
    const model: WritableSignal<IForgetPasswordForm> = signal<IForgetPasswordForm>({
      email: email,
    });

    return TestBed.runInInjectionContext(() =>
      form<IForgetPasswordForm>(model, forgetPasswordSchema),
    );
  };

  const messagesOf = (tree: FieldTree<IForgetPasswordForm>): (string | undefined)[] =>
    tree
      .email()
      .errors()
      .map((error) => error.message);

  it('requires an email', () => {
    const tree: FieldTree<IForgetPasswordForm> = buildForm('');

    expect(tree().invalid()).toBe(true);
    expect(messagesOf(tree)).toContain(AuthValidationMessages.REQUIRED);
  });

  it('rejects a malformed email', () => {
    const tree: FieldTree<IForgetPasswordForm> = buildForm('not-an-email');

    expect(tree().invalid()).toBe(true);
    expect(messagesOf(tree)).toContain(AuthValidationMessages.EMAIL);
  });

  it('accepts a well formed email', () => {
    const tree: FieldTree<IForgetPasswordForm> = buildForm('ada@example.com');

    expect(tree().valid()).toBe(true);
    expect(tree.email().errors()).toEqual([]);
  });
});
