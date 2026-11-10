import { schema } from '@angular/forms/signals';
import { applyTrackMetadataRules } from '../upload-track/upload-track.schema';

import type { Schema } from '@angular/forms/signals';
import type { IEditTrackForm } from '../../models/edit-track-form.model';

export const editTrackFormSchema: Schema<IEditTrackForm> = schema<IEditTrackForm>((form) => {
  applyTrackMetadataRules(form);
});
