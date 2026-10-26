import type { DialogConfig } from '@angular/cdk/dialog';
import type { ModalSize } from '../../core/types/modal-size.type';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IModalOptions<D = unknown> {
  title?: TranslationKey | null;
  subtitle?: TranslationKey | null;
  iconClass?: string | null;
  size?: ModalSize;
  hasHeader?: boolean;
  hasCloseButton?: boolean;
  disableClose?: boolean;
  panelClass?: string | string[];
  ariaLabel?: TranslationKey | null;
  data?: D | null;
}

export interface IModalDialogConfig<D = unknown, R = unknown>
  extends DialogConfig<D, R>, IModalOptions<D> {
  ariaLabel?: TranslationKey | null;
}

export interface IConfirmModalData {
  message: TranslationKey;
  description?: TranslationKey | null;
  confirmText?: TranslationKey;
  cancelText?: TranslationKey;
}
