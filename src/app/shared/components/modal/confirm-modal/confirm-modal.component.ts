import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ButtonComponent } from '../../button/button.component';
import { Constants } from '../../../../core/constants/constants';

import type { IConfirmModalData } from '../../../models/modal.model';

@Component({
  selector: 'app-confirm-modal',
  imports: [ButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  private readonly dialogRef: DialogRef<boolean, ConfirmModalComponent> =
    inject<DialogRef<boolean, ConfirmModalComponent>>(DialogRef);

  public readonly data: IConfirmModalData = inject<IConfirmModalData>(DIALOG_DATA);

  public get confirmText(): string {
    return this.data.confirmText ?? Constants.MODAL_DEFAULT_CONFIRM_TEXT;
  }

  public get cancelText(): string {
    return this.data.cancelText ?? Constants.MODAL_DEFAULT_CANCEL_TEXT;
  }

  public onConfirm(): void {
    this.dialogRef.close(true);
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }
}
