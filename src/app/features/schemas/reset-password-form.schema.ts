import { minLength, required, schema, validate } from "@angular/forms/signals";
import { AuthValidationMessages } from "../constants/auth-error-messages.constant";
import { Constants } from "../../core/constants/constants";
import { passwordRuleErrors } from "../../core/validators/password.validator";

import type { Schema } from "@angular/forms/signals";
import type { IResetPasswordForm } from "../models/reset-password-form.model";

export const resetPasswordSchema: Schema<IResetPasswordForm> = schema<IResetPasswordForm>(form => {
  required(form.password, { message: AuthValidationMessages.REQUIRED });
  minLength(form.password, Constants.MIN_LINGTS_FORM_VALIDATION_PASSWORD, {
    message: AuthValidationMessages.MIN_LENGTH,
  });
  validate(form.password, ({ value }) => passwordRuleErrors(value()));

  required(form.confirmPassword, { message: AuthValidationMessages.REQUIRED });
  validate(form.confirmPassword, ctx =>
    ctx.value() === ctx.valueOf(form.password)
      ? undefined
      : { kind: Constants.PASSWORD_MISMATCH, message: AuthValidationMessages.PASSWORD_MISMATCH }
  );
});
