import { Component, DOCUMENT, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';

import type { IBackupCodesModalData } from '../../models/account-settings-dialog.model';

@Component({
  selector: 'app-backup-codes-modal',
  imports: [ButtonComponent, TranslatePipe],
  templateUrl: './backup-codes-modal.component.html',
  styleUrl: './backup-codes-modal.component.scss',
})
export class BackupCodesModalComponent {
  private readonly dialogRef: DialogRef<boolean, BackupCodesModalComponent> =
    inject<DialogRef<boolean, BackupCodesModalComponent>>(DialogRef);

  private readonly clipboard: Clipboard = inject(Clipboard);

  private readonly document: Document = inject(DOCUMENT);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  public readonly data: IBackupCodesModalData = inject<IBackupCodesModalData>(DIALOG_DATA);

  public onCopy(): void {
    if (this.clipboard.copy(this.codesText())) {
      this.snackbarService.success('accountSettings.backupCodesCopied');
    }
  }

  public onDownload(): void {
    const url: string = URL.createObjectURL(
      new Blob([this.codesText()], { type: Constants.BACKUP_CODES_FILE_TYPE }),
    );
    const link: HTMLAnchorElement = this.document.createElement('a');
    link.href = url;
    link.download = Constants.BACKUP_CODES_FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
  }

  public onDone(): void {
    this.dialogRef.close(true);
  }

  private codesText(): string {
    return this.data.codes.join(Constants.LINE_BREAK);
  }
}
