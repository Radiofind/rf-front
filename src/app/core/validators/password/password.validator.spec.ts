import { describe, expect, it } from 'vitest';
import { passwordRuleErrors } from './password.validator';
import { Constants } from '../../constants/constants';
import { AuthValidationMessages } from '../../../features/constants/auth-error-messages.constant';

import type { ValidationError } from '@angular/forms/signals';

describe('passwordRuleErrors', () => {
  const kindsOf = (password: string): string[] =>
    passwordRuleErrors(password).map((error: ValidationError) => error.kind);

  it('accepts a password that satisfies every rule', () => {
    expect(passwordRuleErrors('Passw0rd!')).toEqual([]);
  });

  it('reports a missing uppercase letter', () => {
    expect(kindsOf('passw0rd!')).toEqual([Constants.UPPERCASE]);
  });

  it('reports a missing lowercase letter', () => {
    expect(kindsOf('PASSW0RD!')).toEqual([Constants.LOWERCASE]);
  });

  it('reports a missing digit', () => {
    expect(kindsOf('Password!')).toEqual([Constants.NUMBER_PROPERTY]);
  });

  it('reports a missing special character', () => {
    expect(kindsOf('Passw0rdd')).toEqual([Constants.SPECIAL_CHARACTER]);
  });

  it('reports a forbidden space', () => {
    expect(kindsOf('Passw0rd !')).toEqual([Constants.SPACES_PROPERTY]);
  });

  it('collects every broken rule at once', () => {
    expect(kindsOf('abc def')).toEqual([
      Constants.UPPERCASE,
      Constants.NUMBER_PROPERTY,
      Constants.SPECIAL_CHARACTER,
      Constants.SPACES_PROPERTY,
    ]);
  });

  it('reports every rule for an empty password', () => {
    expect(kindsOf('')).toEqual([
      Constants.UPPERCASE,
      Constants.LOWERCASE,
      Constants.NUMBER_PROPERTY,
      Constants.SPECIAL_CHARACTER,
    ]);
  });

  it('carries the user facing message for each rule', () => {
    const [error]: ValidationError[] = passwordRuleErrors('passw0rd!');

    expect(error?.message).toBe(AuthValidationMessages.UPPERCASE);
  });
});
