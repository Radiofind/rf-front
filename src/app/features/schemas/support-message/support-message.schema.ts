import { maxLength, required, schema } from '@angular/forms/signals';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import {
  SUPPORT_MESSAGE_MAX_LENGTH,
  SUPPORT_MESSAGE_MAX_LENGTH_MESSAGE,
  SUPPORT_SUBJECT_MAX_LENGTH,
  SUPPORT_SUBJECT_MAX_LENGTH_MESSAGE,
} from '../../constants/support.constant';

import type { Schema } from '@angular/forms/signals';
import type { ISupportMessageForm } from '../../models/support.model';

export const supportMessageFormSchema: Schema<ISupportMessageForm> = schema<ISupportMessageForm>(
  (form) => {
    required(form.subject, { message: AuthValidationMessages.REQUIRED });
    maxLength(form.subject, SUPPORT_SUBJECT_MAX_LENGTH, {
      message: SUPPORT_SUBJECT_MAX_LENGTH_MESSAGE,
    });
    required(form.message, { message: AuthValidationMessages.REQUIRED });
    maxLength(form.message, SUPPORT_MESSAGE_MAX_LENGTH, {
      message: SUPPORT_MESSAGE_MAX_LENGTH_MESSAGE,
    });
  },
);
