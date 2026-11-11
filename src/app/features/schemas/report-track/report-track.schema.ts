import { maxLength, required, schema } from '@angular/forms/signals';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import {
  TRACK_REPORT_COMMENT_MAX_LENGTH,
  TRACK_REPORT_REASON_NEEDING_DETAILS,
} from '../../constants/media-library.constant';
import { SCHEDULE_CHANGE_COMMENT_MAX_LENGTH_MESSAGE } from '../../constants/my-uploads.constant';

import type { Schema } from '@angular/forms/signals';
import type { IReportTrackForm } from '../../models/report-track-form.model';

export const reportTrackFormSchema: Schema<IReportTrackForm> = schema<IReportTrackForm>((form) => {
  required(form.reason, { message: AuthValidationMessages.REQUIRED });
  required(form.comment, {
    message: AuthValidationMessages.REQUIRED,
    when: (context) => context.valueOf(form.reason) === TRACK_REPORT_REASON_NEEDING_DETAILS,
  });
  maxLength(form.comment, TRACK_REPORT_COMMENT_MAX_LENGTH, {
    message: SCHEDULE_CHANGE_COMMENT_MAX_LENGTH_MESSAGE,
  });
});
