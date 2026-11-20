import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { supportMessageFormSchema } from '../../schemas/support-message/support-message.schema';
import {
  SUPPORT_MESSAGE_MAX_LENGTH,
  SUPPORT_MESSAGE_ROWS,
  SUPPORT_SUBJECT_MAX_LENGTH,
} from '../../constants/support.constant';

import type { Signal, WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { ISupportMessageDialogData, ISupportMessageForm } from '../../models/support.model';

@Component({
  selector: 'app-support-message-modal',
  imports: [FormRoot, FormField, ButtonComponent, InputFieldComponent, TranslatePipe],
  templateUrl: './support-message-modal.component.html',
  styleUrl: './support-message-modal.component.scss',
})
export class SupportMessageModalComponent {
  private readonly dialogRef: DialogRef<ISupportMessageForm, SupportMessageModalComponent> =
    inject<DialogRef<ISupportMessageForm, SupportMessageModalComponent>>(DialogRef);

  protected readonly data: ISupportMessageDialogData =
    inject<ISupportMessageDialogData>(DIALOG_DATA);

  private readonly model: WritableSignal<ISupportMessageForm> = signal<ISupportMessageForm>(
    this.data.draft ?? { subject: Constants.EMPTY_STRING, message: Constants.EMPTY_STRING },
  );

  protected readonly messageForm: FieldTree<ISupportMessageForm> = form<ISupportMessageForm>(
    this.model,
    supportMessageFormSchema,
    { submission: { action: () => this.submit() } },
  );

  protected readonly isSendDisabled: Signal<boolean> = computed<boolean>(() =>
    this.messageForm().invalid(),
  );

  protected readonly subjectLimit: number = SUPPORT_SUBJECT_MAX_LENGTH;

  protected readonly messageLimit: number = SUPPORT_MESSAGE_MAX_LENGTH;

  protected readonly messageRows: number = SUPPORT_MESSAGE_ROWS;

  public onCancel(): void {
    this.dialogRef.close();
  }

  private submit(): Promise<undefined> {
    this.dialogRef.close(this.model());

    return Promise.resolve(undefined);
  }
}
