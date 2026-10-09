import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { resetPasswordSchema } from './reset-password-form.schema';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { Constants } from '../../../core/constants/constants';

import type { WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IResetPasswordForm } from '../../models/reset-password-form.model';

describe('resetPasswordSchema', () => {
  const buildForm = (password: string, confirmPassword: string): FieldTree<IResetPasswordForm> => {
    const model: WritableSignal<IResetPasswordForm> = signal<IResetPasswordForm>({
      password: password,
      confirmPassword: confirmPassword,
    });

    return TestBed.runInInjectionContext(() =>
      form<IResetPasswordForm>(model, resetPasswordSchema),
    );
  };

  const kindsOf = (
    tree: FieldTree<IResetPasswordForm>,
    field: 'password' | 'confirmPassword',
  ): string[] =>
    tree[field]()
      .errors()
      .map((error) => error.kind);

  it('requires both fields', () => {
    const tree: FieldTree<IResetPasswordForm> = buildForm('', '');

    expect(tree().invalid()).toBe(true);
    expect(kindsOf(tree, 'password')).toContain(Constants.REQUIRED_PROPERTY);
    expect(kindsOf(tree, 'confirmPassword')).toContain(Constants.REQUIRED_PROPERTY);
  });

  it('enforces the minimum password length', () => {
    const tree: FieldTree<IResetPasswordForm> = buildForm('Pa1!', 'Pa1!');

    expect(
      tree
        .password()
        .errors()
        .map((error) => error.message),
    ).toContain(AuthValidationMessages.MIN_LENGTH);
  });

  it('applies the shared password rules', () => {
    const tree: FieldTree<IResetPasswordForm> = buildForm('password', 'password');

    expect(kindsOf(tree, 'password')).toEqual(
      expect.arrayContaining([
        Constants.UPPERCASE,
        Constants.NUMBER_PROPERTY,
        Constants.SPECIAL_CHARACTER,
      ]),
    );
  });

  it('reports a mismatching confirmation', () => {
    const tree: FieldTree<IResetPasswordForm> = buildForm('Passw0rd!', 'Passw0rd?');

    expect(kindsOf(tree, 'confirmPassword')).toContain(Constants.PASSWORD_MISMATCH);
  });

  it('accepts a strong, matching password pair', () => {
    const tree: FieldTree<IResetPasswordForm> = buildForm('Passw0rd!', 'Passw0rd!');

    expect(tree().valid()).toBe(true);
  });
});
