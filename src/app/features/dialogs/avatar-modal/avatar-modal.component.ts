import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { UserService } from '../../services/user-service/user.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import {
  AVATAR_ACCEPT,
  AVATAR_ALLOWED_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_MAX_SIZE_MB,
  AVATAR_MESSAGES,
} from '../../constants/avatar.constant';

import type { Signal, WritableSignal } from '@angular/core';
import type { IAvatarModalData, IAvatarModalResult } from '../../models/avatar-modal.model';
import { Constants } from '../../../core/constants/constants';

@Component({
  selector: 'app-avatar-modal',
  imports: [ButtonComponent],
  templateUrl: './avatar-modal.component.html',
  styleUrl: './avatar-modal.component.scss',
})
export class AvatarModalComponent {
  private readonly dialogRef: DialogRef<IAvatarModalResult, AvatarModalComponent> =
    inject<DialogRef<IAvatarModalResult, AvatarModalComponent>>(DialogRef);

  private readonly userService: UserService = inject(UserService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  public readonly data: IAvatarModalData = inject<IAvatarModalData>(DIALOG_DATA);

  protected readonly accept: string = AVATAR_ACCEPT;

  protected readonly maxSizeMb: number = AVATAR_MAX_SIZE_MB;

  protected readonly selectedFile: WritableSignal<File | null> = signal<File | null>(null);

  protected readonly previewUrl: WritableSignal<string | null> = signal<string | null>(null);

  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);

  protected readonly isDragOver: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly isPending: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly displayedAvatarUrl: Signal<string | null> = computed<string | null>(
    () => this.previewUrl() ?? this.data.avatarUrl,
  );

  protected readonly canRemove: Signal<boolean> = computed<boolean>(
    () => this.data.avatarUrl !== null && this.selectedFile() === null,
  );

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.revokePreview();
    });
  }

  public onFileChange(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    this.selectFile(input.files?.item(0) ?? null);
    input.value = Constants.EMPTY_STRING;
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  public onDragLeave(): void {
    this.isDragOver.set(false);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    if (!this.isPending()) {
      this.selectFile(event.dataTransfer?.files.item(0) ?? null);
    }
  }

  public onResetSelection(): void {
    this.revokePreview();
    this.selectedFile.set(null);
    this.errorMessage.set(null);
  }

  public async onSave(): Promise<void> {
    const file: File | null = this.selectedFile();

    if (!file || this.isPending()) {
      return;
    }

    this.isPending.set(true);

    try {
      await firstValueFrom(this.userService.uploadNewAvatar(file));
      this.snackbarService.success(AVATAR_MESSAGES.uploaded);
      this.dialogRef.close({ avatar: file });
    } catch {
      this.snackbarService.error(AVATAR_MESSAGES.uploadFailed);
    } finally {
      this.isPending.set(false);
    }
  }

  public async onRemove(): Promise<void> {
    if (this.isPending()) {
      return;
    }

    this.isPending.set(true);

    try {
      await firstValueFrom(this.userService.deleteAvatar(), { defaultValue: undefined });
      this.snackbarService.success(AVATAR_MESSAGES.removed);
      this.dialogRef.close({ avatar: null });
    } catch {
      this.snackbarService.error(AVATAR_MESSAGES.removeFailed);
    } finally {
      this.isPending.set(false);
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  private selectFile(file: File | null): void {
    if (!file) {
      return;
    }

    const error: string | null = this.validate(file);
    this.errorMessage.set(error);

    if (error) {
      return;
    }

    this.revokePreview();
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  private validate(file: File): string | null {
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      return AVATAR_MESSAGES.invalidType;
    }

    return file.size > AVATAR_MAX_SIZE_BYTES ? AVATAR_MESSAGES.tooLarge : null;
  }

  private revokePreview(): void {
    const previewUrl: string | null = this.previewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.previewUrl.set(null);
    }
  }
}
