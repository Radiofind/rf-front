import { maxLength, required, schema, validate } from '@angular/forms/signals';
import { Constants } from '../../../core/constants/constants';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import {
  SCHEDULE_CHANGE_COMMENT_MAX_LENGTH,
  SCHEDULE_CHANGE_COMMENT_MAX_LENGTH_MESSAGE,
  SCHEDULE_CHANGE_DATE_MESSAGE,
} from '../../constants/my-uploads.constant';

import type { Schema } from '@angular/forms/signals';
import type { IScheduleChangeForm } from '../../models/schedule-change-form.model';

export const scheduleChangeFormSchema: Schema<IScheduleChangeForm> = schema<IScheduleChangeForm>(
  (form) => {
    required(form.date, { message: AuthValidationMessages.REQUIRED });
    validate(form.date, ({ value }) => {
      const date: Date | null = value();
      const today: Date = new Date();
      const tomorrow: Date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + Constants.ONE,
      );

      return date && date < tomorrow
        ? { kind: Constants.MIN_DATE_PROPERTY, message: SCHEDULE_CHANGE_DATE_MESSAGE }
        : undefined;
    });
    required(form.time, { message: AuthValidationMessages.REQUIRED });
    maxLength(form.comment, SCHEDULE_CHANGE_COMMENT_MAX_LENGTH, {
      message: SCHEDULE_CHANGE_COMMENT_MAX_LENGTH_MESSAGE,
    });
  },
);
