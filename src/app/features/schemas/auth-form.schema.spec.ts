import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { loginFormSchema, registerFormSchema } from './auth-form.schema';
import { AuthValidationMessages } from '../constants/auth-error-messages.constant';
import { Constants } from '../../core/constants/constants';
import { DEFAULT_ARTIST_TYPE } from '../constants/auth-content.constant';

import type { FieldTree } from '@angular/forms/signals';
import type { ILoginForm, IRegisterForm } from '../models/auth-form.model';

describe('loginFormSchema', () => {
  const buildForm = (model: ILoginForm): FieldTree<ILoginForm> =>
    TestBed.runInInjectionContext(() =>
      form<ILoginForm>(signal<ILoginForm>(model), loginFormSchema),
    );

  it('requires email and password', () => {
    const tree: FieldTree<ILoginForm> = buildForm({ email: '', password: '' });

    expect(tree().invalid()).toBe(true);
    expect(tree.email().errors().map(error => error.kind)).toContain(Constants.REQUIRED_PROPERTY);
    expect(tree.password().errors().map(error => error.kind)).toContain(Constants.REQUIRED_PROPERTY);
  });

  it('rejects a malformed email', () => {
    const tree: FieldTree<ILoginForm> = buildForm({ email: 'nope', password: 'Passw0rd!' });

    expect(tree.email().errors().map(error => error.message)).toContain(
      AuthValidationMessages.EMAIL,
    );
  });

  it('accepts valid credentials and does not apply password rules here', () => {
    const tree: FieldTree<ILoginForm> = buildForm({ email: 'ada@example.com', password: 'weak' });

    expect(tree().valid()).toBe(true);
  });
});

describe('registerFormSchema', () => {
  const validModel: IRegisterForm = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: '',
    dateOfBirth: new Date(1994, 2, 7),
    password: 'Passw0rd!',
    confirmPassword: 'Passw0rd!',
    addInformation: false,
    typeOfArtist: DEFAULT_ARTIST_TYPE,
    artistOrBandName: '',
    description: '',
  };

  const buildForm = (overrides: Partial<IRegisterForm> = {}): FieldTree<IRegisterForm> =>
    TestBed.runInInjectionContext(() =>
      form<IRegisterForm>(
        signal<IRegisterForm>({ ...validModel, ...overrides }),
        registerFormSchema,
      ),
    );

  const kindsOf = (tree: FieldTree<IRegisterForm>, field: keyof IRegisterForm): string[] =>
    (tree[field] as FieldTree<unknown>)().errors().map(error => error.kind);

  const messagesOf = (tree: FieldTree<IRegisterForm>, field: keyof IRegisterForm): (string | undefined)[] =>
    (tree[field] as FieldTree<unknown>)().errors().map(error => error.message);

  it('accepts a complete, valid model', () => {
    expect(buildForm()().valid()).toBe(true);
  });

  it.each(['name', 'surname', 'email', 'password', 'confirmPassword'] as const)(
    'requires %s',
    field => {
      const tree: FieldTree<IRegisterForm> = buildForm({ [field]: '' });

      expect(kindsOf(tree, field)).toContain(Constants.REQUIRED_PROPERTY);
    },
  );

  it('requires the date of birth', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({ dateOfBirth: null });

    expect(kindsOf(tree, 'dateOfBirth')).toContain(Constants.REQUIRED_PROPERTY);
  });

  it.each(['name', 'surname'] as const)('allows only english letters in %s', field => {
    const tree: FieldTree<IRegisterForm> = buildForm({ [field]: 'Ада' });

    expect(messagesOf(tree, field)).toContain(AuthValidationMessages.PATTERN);
  });

  it('accepts a hyphenated name', () => {
    expect(buildForm({ name: 'Anne-Marie' })().valid()).toBe(true);
  });

  it('rejects a malformed email', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({ email: 'nope' });

    expect(messagesOf(tree, 'email')).toContain(AuthValidationMessages.EMAIL);
  });

  it('skips recovery email validation while it is empty', () => {
    expect(buildForm({ recoveryEmail: '' })().valid()).toBe(true);
  });

  it('validates the recovery email once it is filled in', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({ recoveryEmail: 'nope' });

    expect(messagesOf(tree, 'recoveryEmail')).toContain(AuthValidationMessages.EMAIL);
  });

  it('rejects a birth date in the future', () => {
    const future: Date = new Date();
    future.setFullYear(future.getFullYear() + 1);

    expect(messagesOf(buildForm({ dateOfBirth: future }), 'dateOfBirth')).toContain(
      AuthValidationMessages.FUTURE_DATE,
    );
  });

  it('rejects a birth date more than a hundred years ago', () => {
    const tooOld: Date = new Date();
    tooOld.setFullYear(tooOld.getFullYear() - Constants.MIN_BIRTH_DATE - 1);

    expect(messagesOf(buildForm({ dateOfBirth: tooOld }), 'dateOfBirth')).toContain(
      AuthValidationMessages.MAX_AGE,
    );
  });

  it('enforces the minimum password length', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({ password: 'Pa1!', confirmPassword: 'Pa1!' });

    expect(messagesOf(tree, 'password')).toContain(AuthValidationMessages.MIN_LENGTH);
  });

  it('applies the shared password rules', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({
      password: 'password',
      confirmPassword: 'password',
    });

    expect(kindsOf(tree, 'password')).toEqual(
      expect.arrayContaining([
        Constants.UPPERCASE,
        Constants.NUMBER_PROPERTY,
        Constants.SPECIAL_CHARACTER,
      ]),
    );
  });

  it('reports a mismatching confirmation', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({ confirmPassword: 'Passw0rd?' });

    expect(kindsOf(tree, 'confirmPassword')).toContain(Constants.PASSWORD_MISMATCH);
  });

  it('ignores the artist fields while the extra information is switched off', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({
      addInformation: false,
      artistOrBandName: 'Артист',
      description: 'Описание',
    });

    expect(tree().valid()).toBe(true);
  });

  it('validates the artist name pattern once the extra information is switched on', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({
      addInformation: true,
      artistOrBandName: 'Артист',
    });

    expect(messagesOf(tree, 'artistOrBandName')).toContain(
      AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    );
  });

  it('validates the description pattern once the extra information is switched on', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({
      addInformation: true,
      description: 'Описание',
    });

    expect(messagesOf(tree, 'description')).toContain(
      AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    );
  });

  it('caps the artist name length', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({
      addInformation: true,
      artistOrBandName: 'a'.repeat(Constants.MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME + 1),
    });

    expect(messagesOf(tree, 'artistOrBandName')).toContain(AuthValidationMessages.MAX_LENGTH);
  });

  it('accepts artist details with spaces and punctuation', () => {
    const tree: FieldTree<IRegisterForm> = buildForm({
      addInformation: true,
      artistOrBandName: 'The Band (Live!)',
      description: 'Indie rock, since 2019.',
    });

    expect(tree().valid()).toBe(true);
  });

  it('leaves the optional artist fields valid when they stay empty', () => {
    expect(buildForm({ addInformation: true })().valid()).toBe(true);
  });
});
