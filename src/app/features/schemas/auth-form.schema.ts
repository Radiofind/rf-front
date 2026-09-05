import {
  applyWhen,
  email,
  maxDate,
  maxLength,
  minDate,
  minLength,
  pattern,
  required,
  type Schema,
  schema,
  validate,
} from '@angular/forms/signals';
import { Constants } from '../../core/constants/constants';
import { passwordRuleErrors } from '../../core/validators/password.validator';
import { AuthValidationMessages } from '../constants/auth-error-messages.constant';
import type { ILoginForm, IRegisterForm } from '../models/auth-form.model';

const earliestBirthDate = (): Date => {
  const date: Date = new Date();
  date.setFullYear(date.getFullYear() - Constants.MIN_BIRTH_DATE);
  return date;
}

export const loginFormSchema: Schema<ILoginForm> = schema<ILoginForm>(form => {
  required(form.email, { message: AuthValidationMessages.REQUIRED });
  email(form.email, { message: AuthValidationMessages.EMAIL });

  required(form.password, { message: AuthValidationMessages.REQUIRED });
});

export const registerFormSchema: Schema<IRegisterForm> = schema<IRegisterForm>(form => {
  required(form.name, { message: AuthValidationMessages.REQUIRED });
  pattern(form.name, Constants.EN_VALIDATOR_PATTERN, { message: AuthValidationMessages.PATTERN });

  required(form.surname, { message: AuthValidationMessages.REQUIRED });
  pattern(form.surname, Constants.EN_VALIDATOR_PATTERN, { message: AuthValidationMessages.PATTERN });

  required(form.email, { message: AuthValidationMessages.REQUIRED });
  email(form.email, { message: AuthValidationMessages.EMAIL });

  email(form.recoveryEmail, {
    message: AuthValidationMessages.EMAIL,
    when: ({ value }) => !!value(),
  });

  required(form.dateOfBirth, { message: AuthValidationMessages.REQUIRED });
  minDate(form.dateOfBirth, earliestBirthDate, { message: AuthValidationMessages.MAX_AGE });
  maxDate(form.dateOfBirth, () => new Date(), { message: AuthValidationMessages.FUTURE_DATE });

  required(form.password, { message: AuthValidationMessages.REQUIRED });
  minLength(form.password, Constants.MIN_LINGTS_FORM_VALIDATION_PASSWORD, {
    message: AuthValidationMessages.MIN_LENGTH,
  });
  validate(form.password, ({ value }) => passwordRuleErrors(value()));

  required(form.confirmPassword, { message: AuthValidationMessages.REQUIRED });

  validate(form.confirmPassword, ({ value, valueOf }) =>
    value() === valueOf(form.password)
      ? undefined
      : { kind: Constants.PASSWORD_MISMATCH, message: AuthValidationMessages.PASSWORD_MISMATCH }
  );

  applyWhen(form, ({ value }) => value().addInformation, artist => {
    maxLength(artist.artistOrBandName, Constants.MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME, {
      message: AuthValidationMessages.MAX_LENGTH,
    });
    pattern(artist.artistOrBandName, Constants.EN_VALIDATOR_PATTERN, {
      message: AuthValidationMessages.PATTERN,
      when: ({ value }) => !!value(),
    });
    pattern(artist.description, Constants.EN_VALIDATOR_PATTERN, {
      message: AuthValidationMessages.PATTERN,
      when: ({ value }) => !!value(),
    });
  });
});
