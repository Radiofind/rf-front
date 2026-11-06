import { Component, computed, effect, input, model, output, signal } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { TranslatePipe } from '../../pipes/translate/translate.pipe';
import { TranslateErrorPipe } from '../../pipes/translate-error/translate-error.pipe';

import type {
  InputSignal,
  ModelSignal,
  OutputEmitterRef,
  Signal,
  WritableSignal,
} from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-file-dropzone',
  imports: [TranslatePipe, TranslateErrorPipe],
  templateUrl: './file-dropzone.component.html',
  styleUrl: './file-dropzone.component.scss',
})
export class FileDropzoneComponent implements FormValueControl<File | null> {
  public readonly value: ModelSignal<File | null> = model<File | null>(null);

  public readonly errors: InputSignal<readonly ValidationError.WithOptionalFieldTree[]> = input<
    readonly ValidationError.WithOptionalFieldTree[]
  >([]);

  public readonly touched: InputSignal<boolean> = input<boolean>(false);

  public readonly dirty: InputSignal<boolean> = input<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly fieldId: InputSignal<string> = input.required<string>();

  public readonly accept: InputSignal<string> = input<string>(Constants.EMPTY_STRING);

  public readonly iconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly dropzoneTitle: InputSignal<string | null> = input<string | null>(null);

  public readonly dropzoneAction: InputSignal<string | null> = input<string | null>(null);

  public readonly dropzoneHint: InputSignal<string | null> = input<string | null>(null);

  public readonly hasImagePreview: InputSignal<boolean> = input<boolean>(false);

  public readonly isDragOver: WritableSignal<boolean> = signal<boolean>(false);

  public readonly previewUrl: WritableSignal<string | null> = signal<string | null>(null);

  public readonly visibleErrors: Signal<readonly ValidationError.WithOptionalFieldTree[]> =
    computed(() => (this.touched() || this.dirty() ? this.errors() : []));

  public readonly fileSizeMb: Signal<string | null> = computed<string | null>(() => {
    const file: File | null = this.value();
    return file ? (file.size / Constants.BYTES_IN_MEGABYTE).toFixed(Constants.ONE) : null;
  });

  constructor() {
    effect((onCleanup) => {
      const file: File | null = this.value();

      if (!file || !this.hasImagePreview()) {
        this.previewUrl.set(null);
        return;
      }

      const previewUrl: string = URL.createObjectURL(file);
      this.previewUrl.set(previewUrl);
      onCleanup(() => {
        URL.revokeObjectURL(previewUrl);
      });
    });
  }

  public onFileChange(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    this.selectFile(input.files?.item(Constants.ZERO) ?? null);
    input.value = Constants.EMPTY_STRING;
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (!this.disabled()) {
      this.isDragOver.set(true);
    }
  }

  public onDragLeave(): void {
    this.isDragOver.set(false);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    if (!this.disabled()) {
      this.selectFile(event.dataTransfer?.files.item(Constants.ZERO) ?? null);
    }
  }

  public onRemove(): void {
    this.value.set(null);
    this.touch.emit();
  }

  private selectFile(file: File | null): void {
    if (file) {
      this.value.set(file);
      this.touch.emit();
    }
  }
}
