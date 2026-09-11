import type { DialogConfig } from '@angular/cdk/dialog';
import type { ModalSize } from '../../core/types/modal-size.type';

export interface IModalOptions<D = unknown> {
  title?: string | null;
  subtitle?: string | null;
  iconClass?: string | null;
  size?: ModalSize;
  hasHeader?: boolean;
  hasCloseButton?: boolean;
  disableClose?: boolean;
  panelClass?: string | string[];
  ariaLabel?: string | null;
  data?: D | null;
}

export interface IModalDialogConfig<D = unknown, R = unknown>
  extends DialogConfig<D, R>, IModalOptions<D> {}

export interface IConfirmModalData {
  message: string;
  description?: string | null;
  confirmText?: string;
  cancelText?: string;
}
