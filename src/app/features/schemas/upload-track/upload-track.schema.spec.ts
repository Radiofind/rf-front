import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { uploadTrackFormSchema } from './upload-track.schema';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { ProfileValidationMessages } from '../../constants/profile-error-messages.constant';
import { UploadTrackValidationMessages } from '../../constants/upload-track-error-messages.constant';

import type { FieldTree } from '@angular/forms/signals';
import type { IUploadTrackForm } from '../../models/upload-track-form.model';

describe('uploadTrackFormSchema', () => {
  const validModel: IUploadTrackForm = {
    title: 'Midnight Dreams',
    genres: ['DEEP_HOUSE'],
    description: '',
    audio: new File(['audio'], 'song.mp3'),
    cover: null,
  };

  const buildForm = (overrides: Partial<IUploadTrackForm> = {}): FieldTree<IUploadTrackForm> =>
    TestBed.runInInjectionContext(() =>
      form<IUploadTrackForm>(
        signal<IUploadTrackForm>({ ...validModel, ...overrides }),
        uploadTrackFormSchema,
      ),
    );

  const messagesOf = (field: FieldTree<unknown>): string[] =>
    field()
      .errors()
      .map((error) => error.message ?? '');

  it('accepts a track with audio, title and genre only', () => {
    expect(buildForm()().valid()).toBe(true);
  });

  it('requires the audio file, the title and the genre', () => {
    const tree: FieldTree<IUploadTrackForm> = buildForm({ audio: null, title: '', genres: [] });

    expect(messagesOf(tree.audio)).toEqual([UploadTrackValidationMessages.AUDIO_REQUIRED]);
    expect(messagesOf(tree.title)).toEqual([AuthValidationMessages.REQUIRED]);
    expect(messagesOf(tree.genres)).toEqual([UploadTrackValidationMessages.GENRE_REQUIRED]);
  });

  it('allows at most three genres', () => {
    const tree: FieldTree<IUploadTrackForm> = buildForm({
      genres: ['GRUNGE', 'INDIE_ROCK', 'BEBOP', 'DEEP_HOUSE'],
    });

    expect(messagesOf(tree.genres)).toEqual([UploadTrackValidationMessages.MAX_GENRES]);
  });

  it('rejects an audio file that is not MP3, WAV or FLAC', () => {
    const tree: FieldTree<IUploadTrackForm> = buildForm({
      audio: new File(['audio'], 'song.ogg'),
    });

    expect(messagesOf(tree.audio)).toEqual(['validation.audioType']);
  });

  it('rejects a cover that is not JPG or PNG', () => {
    const tree: FieldTree<IUploadTrackForm> = buildForm({
      cover: new File(['image'], 'cover.gif'),
    });

    expect(messagesOf(tree.cover)).toEqual(['validation.coverType']);
  });

  it('limits the title to 150 and the description to 1000 characters', () => {
    const tree: FieldTree<IUploadTrackForm> = buildForm({
      title: 'a'.repeat(151),
      description: 'a'.repeat(1001),
    });

    expect(messagesOf(tree.title)).toEqual([UploadTrackValidationMessages.MAX_LENGTH_TITLE]);
    expect(messagesOf(tree.description)).toEqual([
      ProfileValidationMessages.MAX_LENGTH_DESCRIPTION,
    ]);
  });

  it('applies the latin-only rule to the title and the description', () => {
    const tree: FieldTree<IUploadTrackForm> = buildForm({
      title: 'Полночь',
      description: 'Описание',
    });

    expect(messagesOf(tree.title)).toEqual([
      AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    ]);
    expect(messagesOf(tree.description)).toEqual([
      AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    ]);
  });
});
