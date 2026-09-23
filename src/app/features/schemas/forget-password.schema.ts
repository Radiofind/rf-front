import { email, required, schema } from '@angular/forms/signals';
import { AuthValidationMessages } from '../constants/auth-error-messages.constant';

import type { Schema } from '@angular/forms/signals';
import type { IForgetPasswordForm } from '../models/forget-password.model';

export const forgetPasswordSchema: Schema<IForgetPasswordForm> = schema<IForgetPasswordForm>(
  (form) => {
    required(form.email, { message: AuthValidationMessages.REQUIRED });
    email(form.email, { message: AuthValidationMessages.EMAIL });
  },
);
