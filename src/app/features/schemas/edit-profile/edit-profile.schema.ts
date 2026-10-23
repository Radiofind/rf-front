import { email, maxLength, pattern, required, schema, validate } from '@angular/forms/signals';
import { Constants } from '../../../core/constants/constants';
import { socialLinkError } from '../../../core/validators/social-link/social-link.validator';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { ProfileValidationMessages } from '../../constants/profile-error-messages.constant';
import { SOCIAL_LINKS } from '../../constants/edit-profile.constant';

import type { Schema } from '@angular/forms/signals';
import type { IEditProfileForm, ISocialLinkConfig } from '../../models/edit-profile-form.model';

export const editProfileFormSchema: Schema<IEditProfileForm> = schema<IEditProfileForm>((form) => {
  required(form.name, { message: AuthValidationMessages.REQUIRED });
  pattern(form.name, Constants.EN_VALIDATOR_PATTERN, { message: AuthValidationMessages.PATTERN });
  maxLength(form.name, Constants.MAX_LENGTH_FORM_NAME, {
    message: ProfileValidationMessages.MAX_LENGTH_NAME,
  });

  required(form.surname, { message: AuthValidationMessages.REQUIRED });
  pattern(form.surname, Constants.EN_VALIDATOR_PATTERN, {
    message: AuthValidationMessages.PATTERN,
  });
  maxLength(form.surname, Constants.MAX_LENGTH_FORM_NAME, {
    message: ProfileValidationMessages.MAX_LENGTH_NAME,
  });

  required(form.email, { message: AuthValidationMessages.REQUIRED });
  email(form.email, { message: AuthValidationMessages.EMAIL });
  maxLength(form.email, Constants.MAX_LENGTH_FORM_EMAIL, {
    message: ProfileValidationMessages.MAX_LENGTH_EMAIL,
  });

  email(form.recoveryEmail, {
    message: AuthValidationMessages.EMAIL,
    when: ({ value }) => !!value(),
  });
  maxLength(form.recoveryEmail, Constants.MAX_LENGTH_FORM_EMAIL, {
    message: ProfileValidationMessages.MAX_LENGTH_EMAIL,
  });
  validate(form.recoveryEmail, (ctx) => {
    const recoveryEmail: string = ctx.value().trim().toLowerCase();

    return recoveryEmail && recoveryEmail === ctx.valueOf(form.email).trim().toLowerCase()
      ? { kind: Constants.SAME_EMAIL_PROPERTY, message: ProfileValidationMessages.SAME_EMAIL }
      : undefined;
  });

  maxLength(form.artistName, Constants.MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME, {
    message: AuthValidationMessages.MAX_LENGTH,
  });
  pattern(form.artistName, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });

  maxLength(form.shortDescription, Constants.MAX_LENGTH_FORM_SHORT_DESCRIPTION, {
    message: ProfileValidationMessages.MAX_LENGTH_SHORT_DESCRIPTION,
  });
  pattern(form.shortDescription, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });

  maxLength(form.description, Constants.MAX_LENGTH_FORM_DESCRIPTION, {
    message: ProfileValidationMessages.MAX_LENGTH_DESCRIPTION,
  });
  pattern(form.description, Constants.EN_PLUS_SPACES_AND_SYMBOLS, {
    message: AuthValidationMessages.PATTERN_WITH_SPACES_AND_SYMBOLS,
    when: ({ value }) => !!value(),
  });

  maxLength(form.mainGenres, Constants.MAX_MAIN_GENRES, {
    message: ProfileValidationMessages.MAX_MAIN_GENRES,
  });
  maxLength(form.additionalGenres, Constants.MAX_ADDITIONAL_GENRES, {
    message: ProfileValidationMessages.MAX_ADDITIONAL_GENRES,
  });

  SOCIAL_LINKS.forEach((link: ISocialLinkConfig) => {
    validate(form.socialLinks[link.key], ({ value }) =>
      socialLinkError(value().trim(), link.label, link.domains),
    );
  });
});
