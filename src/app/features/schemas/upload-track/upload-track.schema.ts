import { maxLength, pattern, required, schema, validate } from '@angular/forms/signals';
import { Constants } from '../../../core/constants/constants';
import { fileError } from '../../../core/validators/file/file.validator';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { ProfileValidationMessages } from '../../constants/profile-error-messages.constant';
import { UploadTrackValidationMessages } from '../../constants/upload-track-error-messages.constant';
import {
  AUDIO_FILE_RULES,
  COVER_FILE_RULES,
  MAX_TRACK_GENRES,
  TRACK_DESCRIPTION_MAX_LENGTH,
  TRACK_TITLE_MAX_LENGTH,
} from '../../constants/upload-track.constant';

import type { Schema, SchemaPath } from '@angular/forms/signals';
import type { IUploadTrackForm } from '../../models/upload-track-form.model';

export interface ITrackMetadataPaths {
  title: SchemaPath<string>;
  genres: SchemaPath<string[]>;
  description: SchemaPath<string>;
  cover: SchemaPath<File | null>;
}

export function applyTrackMetadataRules({
  title,
  genres,
  description,
  cover,
}: ITrackMetadataPaths): void {
  validate(cover, ({ value }) => fileError(value(), COVER_FILE_RULES));

  required(title, { message: AuthValidationMessages.REQUIRED });
  maxLength(title, TRACK_TITLE_MAX_LENGTH, {
    message: UploadTrackValidationMessages.MAX_LENGTH_TITLE,
  });
  pattern(title, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });

  validate(genres, ({ value }) =>
    value().length
      ? undefined
      : {
          kind: Constants.REQUIRED_PROPERTY,
          message: UploadTrackValidationMessages.GENRE_REQUIRED,
        },
  );
  maxLength(genres, MAX_TRACK_GENRES, { message: UploadTrackValidationMessages.MAX_GENRES });

  maxLength(description, TRACK_DESCRIPTION_MAX_LENGTH, {
    message: ProfileValidationMessages.MAX_LENGTH_DESCRIPTION,
  });
  pattern(description, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });
}

export const uploadTrackFormSchema: Schema<IUploadTrackForm> = schema<IUploadTrackForm>((form) => {
  required(form.audio, { message: UploadTrackValidationMessages.AUDIO_REQUIRED });
  validate(form.audio, ({ value }) => fileError(value(), AUDIO_FILE_RULES));

  applyTrackMetadataRules(form);
});
