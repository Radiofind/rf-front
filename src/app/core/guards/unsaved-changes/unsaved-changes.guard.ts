import { inject } from '@angular/core';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { Constants } from '../../constants/constants';

import type { CanDeactivateFn } from '@angular/router';
import type { IHasUnsavedChanges } from '../../models/unsaved-changes.model';

export const unsavedChangesGuard: CanDeactivateFn<IHasUnsavedChanges> = (
  component: IHasUnsavedChanges,
) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return inject(ModalService).confirm(
    {
      message: Constants.UNSAVED_CHANGES_MESSAGE,
      confirmText: Constants.YES,
      cancelText: Constants.NO,
    },
    {
      title: Constants.UNSAVED_CHANGES_TITLE,
      iconClass: Constants.UNSAVED_CHANGES_ICON_CLASS,
    },
  );
};
