import { inject, Service, signal, type WritableSignal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { map } from 'rxjs';
import { ModalSizeEnum } from '../../../core/enums/modal-size.enum';
import { ConfirmModalComponent } from '../../components/modal/confirm-modal/confirm-modal.component';
import { ModalContainerComponent } from '../../components/modal/modal-container/modal-container.component';
import { Constants } from '../../../core/constants/constants';

import type { ComponentType } from '@angular/cdk/overlay';
import type { DialogRef } from '@angular/cdk/dialog';
import type { Observable } from 'rxjs';
import type { ModalSize } from '../../../core/types/modal-size.type';
import type {
  IConfirmModalData,
  IModalDialogConfig,
  IModalOptions,
} from '../../models/modal.model';

@Service()
export class ModalService {
  private readonly dialog: Dialog = inject(Dialog);

  private readonly defaultSize: ModalSize = ModalSizeEnum.MEDIUM;

  private readonly hasHeaderByDefault: WritableSignal<boolean> = signal<boolean>(true);

  private readonly hasCloseButtonByDefault: WritableSignal<boolean> = signal<boolean>(true);

  private readonly isDisabledCloseByDefault: WritableSignal<boolean> = signal<boolean>(false);

  private readonly defaultConfirmResult: WritableSignal<boolean> = signal<boolean>(false);

  private readonly sizeWidths: Readonly<Record<ModalSize, string>> = {
    [ModalSizeEnum.SMALL]: Constants.MODAL_SIZE_SMALL,
    [ModalSizeEnum.MEDIUM]: Constants.MODAL_SIZE_MEDIUM,
    [ModalSizeEnum.LARGE]: Constants.MODAL_SIZE_LARGE,
  };

  public open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    options: IModalOptions<D> = {},
  ): DialogRef<R, C> {
    const size: ModalSize = options.size ?? this.defaultSize;

    const config: IModalDialogConfig<D, DialogRef<R, C>> = {
      ...options,
      size: size,
      container: ModalContainerComponent,
      width: this.sizeWidths[size],
      maxWidth: Constants.MODAL_MAX_WIDTH,
      maxHeight: Constants.MODAL_MAX_HEIGHT,
      panelClass: options.panelClass ?? Constants.MODAL_PANEL_CLASS,
      backdropClass: Constants.MODAL_BACKDROP_CLASS,
      hasBackdrop: true,
      ariaModal: true,
      restoreFocus: true,
      autoFocus: Constants.MODAL_AUTO_FOCUS_TARGET,
      hasHeader: options.hasHeader ?? this.hasHeaderByDefault(),
      hasCloseButton: options.hasCloseButton ?? this.hasCloseButtonByDefault(),
      disableClose: options.disableClose ?? this.isDisabledCloseByDefault(),
    };

    return this.dialog.open<R, D, C>(component, config);
  }

  public confirm(
    data: IConfirmModalData,
    options: IModalOptions<IConfirmModalData> = {},
  ): Observable<boolean> {
    const modalRef: DialogRef<boolean, ConfirmModalComponent> = this.open<
      boolean,
      IConfirmModalData,
      ConfirmModalComponent
    >(ConfirmModalComponent, {
      size: ModalSizeEnum.SMALL,
      ...options,
      data: data,
    });

    return modalRef.closed.pipe(map((result) => result ?? this.defaultConfirmResult()));
  }

  public closeAll(): void {
    this.dialog.closeAll();
  }
}
