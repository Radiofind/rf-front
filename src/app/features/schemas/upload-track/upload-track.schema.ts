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

import type { Schema } from '@angular/forms/signals';
import type { IUploadTrackForm } from '../../models/upload-track-form.model';

export const uploadTrackFormSchema: Schema<IUploadTrackForm> = schema<IUploadTrackForm>((form) => {
  required(form.audio, { message: UploadTrackValidationMessages.AUDIO_REQUIRED });
  validate(form.audio, ({ value }) => fileError(value(), AUDIO_FILE_RULES));

  validate(form.cover, ({ value }) => fileError(value(), COVER_FILE_RULES));

  required(form.title, { message: AuthValidationMessages.REQUIRED });
  maxLength(form.title, TRACK_TITLE_MAX_LENGTH, {
    message: UploadTrackValidationMessages.MAX_LENGTH_TITLE,
  });
  pattern(form.title, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });

  validate(form.genres, ({ value }) =>
    value().length
      ? undefined
      : {
          kind: Constants.REQUIRED_PROPERTY,
          message: UploadTrackValidationMessages.GENRE_REQUIRED,
        },
  );
  maxLength(form.genres, MAX_TRACK_GENRES, { message: UploadTrackValidationMessages.MAX_GENRES });

  maxLength(form.description, TRACK_DESCRIPTION_MAX_LENGTH, {
    message: ProfileValidationMessages.MAX_LENGTH_DESCRIPTION,
  });
  pattern(form.description, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });
});
