import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { editProfileFormSchema } from './edit-profile.schema';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { ProfileValidationMessages } from '../../constants/profile-error-messages.constant';
import { EMPTY_SOCIAL_LINKS_FORM } from '../../constants/edit-profile.constant';
import { Constants } from '../../../core/constants/constants';

import type { FieldTree } from '@angular/forms/signals';
import type { IEditProfileForm } from '../../models/edit-profile-form.model';

describe('editProfileFormSchema', () => {
  const validModel: IEditProfileForm = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    recoveryEmail: '',
    artistType: 'Artist',
    artistName: '',
    shortDescription: '',
    description: '',
    mainGenres: [],
    additionalGenres: [],
    socialLinks: { ...EMPTY_SOCIAL_LINKS_FORM },
  };

  const buildForm = (overrides: Partial<IEditProfileForm> = {}): FieldTree<IEditProfileForm> =>
    TestBed.runInInjectionContext(() =>
      form<IEditProfileForm>(
        signal<IEditProfileForm>({ ...validModel, ...overrides }),
        editProfileFormSchema,
      ),
    );

  const messagesOf = (field: FieldTree<unknown>): string[] =>
    field()
      .errors()
      .map((error) => error.message ?? '');

  it('accepts a profile where only name, surname and email are filled', () => {
    expect(buildForm()().valid()).toBe(true);
  });

  it('requires name, surname and email', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({ name: '', surname: '', email: '' });

    expect(messagesOf(tree.name)).toContain(AuthValidationMessages.REQUIRED);
    expect(messagesOf(tree.surname)).toContain(AuthValidationMessages.REQUIRED);
    expect(messagesOf(tree.email)).toContain(AuthValidationMessages.REQUIRED);
  });

  it('rejects malformed email and recovery email', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      email: 'nope',
      recoveryEmail: 'also-nope',
    });

    expect(messagesOf(tree.email)).toContain(AuthValidationMessages.EMAIL);
    expect(messagesOf(tree.recoveryEmail)).toContain(AuthValidationMessages.EMAIL);
  });

  it('rejects a recovery email equal to the main email', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({ recoveryEmail: 'ADA@example.com' });

    expect(messagesOf(tree.recoveryEmail)).toEqual([ProfileValidationMessages.SAME_EMAIL]);
  });

  it('applies the latin-only rule to the name fields', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({ name: 'Ада', surname: 'Love lace' });

    expect(messagesOf(tree.name)).toContain(AuthValidationMessages.PATTERN);
    expect(messagesOf(tree.surname)).toContain(AuthValidationMessages.PATTERN);
  });

  it('limits the length of the descriptions', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      shortDescription: 'a'.repeat(Constants.MAX_LENGTH_FORM_SHORT_DESCRIPTION + 1),
      description: 'a'.repeat(Constants.MAX_LENGTH_FORM_DESCRIPTION + 1),
    });

    expect(messagesOf(tree.shortDescription)).toEqual([
      ProfileValidationMessages.MAX_LENGTH_SHORT_DESCRIPTION,
    ]);
    expect(messagesOf(tree.description)).toEqual([
      ProfileValidationMessages.MAX_LENGTH_DESCRIPTION,
    ]);
  });

  it('accepts the descriptions right at the limit', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      shortDescription: 'a'.repeat(Constants.MAX_LENGTH_FORM_SHORT_DESCRIPTION),
      description: 'a'.repeat(Constants.MAX_LENGTH_FORM_DESCRIPTION),
    });

    expect(tree().valid()).toBe(true);
  });

  it('limits the number of main and additional genres', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      mainGenres: ['ROCK', 'JAZZ', 'POP', 'FOLK'],
      additionalGenres: Array.from({ length: Constants.MAX_ADDITIONAL_GENRES + 1 }, (_, i) =>
        String(i),
      ),
    });

    expect(messagesOf(tree.mainGenres)).toEqual([ProfileValidationMessages.MAX_MAIN_GENRES]);
    expect(messagesOf(tree.additionalGenres)).toEqual([
      ProfileValidationMessages.MAX_ADDITIONAL_GENRES,
    ]);
  });

  it('accepts social links that lead to their platform', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      socialLinks: {
        ...EMPTY_SOCIAL_LINKS_FORM,
        telegram: 'https://t.me/ada',
        bandcamp: 'https://ada.bandcamp.com',
        youtube: '  https://youtu.be/xyz  ',
      },
    });

    expect(tree().valid()).toBe(true);
  });

  it('rejects a social link that leads to another platform', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      socialLinks: { ...EMPTY_SOCIAL_LINKS_FORM, telegram: 'https://instagram.com/ada' },
    });

    expect(tree.socialLinks.telegram().errors()).toEqual([
      expect.objectContaining({
        message: ProfileValidationMessages.WRONG_SOCIAL_LINK,
        params: { platform: 'Telegram' },
      }),
    ]);
    expect(tree().valid()).toBe(false);
  });

  it('rejects a social link that is not a url', () => {
    const tree: FieldTree<IEditProfileForm> = buildForm({
      socialLinks: { ...EMPTY_SOCIAL_LINKS_FORM, spotify: 'my spotify' },
    });

    expect(messagesOf(tree.socialLinks.spotify)).toEqual([ProfileValidationMessages.INVALID_URL]);
  });
});
