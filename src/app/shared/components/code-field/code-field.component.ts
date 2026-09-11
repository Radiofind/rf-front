import { Component, computed, input, model, output, viewChildren } from '@angular/core';
import { Constants } from '../../../core/constants/constants';

import type { ElementRef, OutputEmitterRef, InputSignal, ModelSignal, Signal } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-code-field',
  templateUrl: './code-field.component.html',
  styleUrl: './code-field.component.scss',
})

export class CodeFieldComponent implements FormValueControl<string> {
  public readonly value: ModelSignal<string> = model<string>(Constants.EMPTY_STRING);

  public readonly errors: InputSignal<readonly ValidationError.WithOptionalFieldTree[]> =
    input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  public readonly touched: InputSignal<boolean> = input<boolean>(false);

  public readonly dirty: InputSignal<boolean> = input<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly required: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly codeLength: InputSignal<number> = input<number>(Constants.CODE_FIELD_DEFAULT_LENGTH);

  public readonly cellPlaceholder: InputSignal<string> = input<string>(Constants.CODE_FIELD_PLACEHOLDER);

  public readonly cellAriaLabel: InputSignal<string> = input<string>(Constants.CODE_FIELD_CELL_AREA_LABEL);

  public readonly cells: Signal<string[]> = computed(() => {
    const characters: string[] = this.value().split(Constants.EMPTY_STRING);

    return Array.from(
      { length: this.codeLength() },
      (_value, index) => characters[index] ?? Constants.EMPTY_STRING,
    );
  });

  public readonly visibleErrors: Signal<readonly ValidationError.WithOptionalFieldTree[]> = computed(() =>
    this.touched() || this.dirty() ? this.errors() : []
  );

  public readonly isCodeInvalid: Signal<boolean> = computed(() => this.visibleErrors().length > Constants.ZERO);

  private readonly cellElements: Signal<readonly ElementRef<HTMLInputElement>[]> =
    viewChildren<ElementRef<HTMLInputElement>>(Constants.CELL_FIELD);

  public onInput(event: Event, index: number): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const digits: string = this.toDigits(target.value);

    if (digits.length === Constants.ZERO) {
      target.value = Constants.EMPTY_STRING;
      this.writeDigits(index, Constants.EMPTY_STRING);
      return;
    };

    this.writeDigits(index, digits);
    this.focusCell(index + digits.length);
  }

  public onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === Constants.BACKSPACE_KEY) {
      event.preventDefault();
      this.onBackspace(index);
      return;
    };

    if (event.key === Constants.ARROW_LEFT_KEY) {
      event.preventDefault();
      this.focusCell(index - Constants.ONE);
      return;
    };

    if (event.key === Constants.ARROW_RIGHT_KEY) {
      event.preventDefault();
      this.focusCell(index + Constants.ONE);
    };
  }

  public onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();

    const pastedText: string = event.clipboardData?.getData(Constants.CLIPBOARD_FORMAT)
      ?? Constants.EMPTY_STRING;
    const digits: string = this.toDigits(pastedText);

    if (digits.length === Constants.ZERO) {
      return;
    };

    this.writeDigits(index, digits);
    this.focusCell(index + digits.length);
  }

  public onFocus(event: FocusEvent, index: number): void {
    const firstEmptyIndex: number = this.firstEmptyIndex();

    if (firstEmptyIndex !== Constants.NOT_FOUND_INDEX && index > firstEmptyIndex) {
      this.focusCell(firstEmptyIndex);
      return;
    };

    (event.target as HTMLInputElement).select();
  }

  private onBackspace(index: number): void {
    const isCurrentCellFilled: boolean = (this.cells()[index] ?? Constants.EMPTY_STRING) !== Constants.EMPTY_STRING;

    if (isCurrentCellFilled) {
      this.writeDigits(index, Constants.EMPTY_STRING);
      return;
    };

    if (index > Constants.ZERO) {
      this.writeDigits(index - Constants.ONE, Constants.EMPTY_STRING);
      this.focusCell(index - Constants.ONE);
    };
  }

  private writeDigits(index: number, digits: string): void {
    const characters: string[] = [...this.cells()];

    if (digits.length === Constants.ZERO) {
      characters[index] = Constants.EMPTY_STRING;
    } else {
      for (let offset: number = Constants.ZERO; offset < digits.length; offset++) {
        const cellIndex: number = index + offset;

        if (cellIndex >= this.codeLength()) {
          break;
        };

        characters[cellIndex] = digits[offset] ?? Constants.EMPTY_STRING;
      };
    };

    this.value.set(characters.join(Constants.EMPTY_STRING));
  }

  private focusCell(index: number): void {
    const cellElements: readonly ElementRef<HTMLInputElement>[] = this.cellElements();
    const targetIndex: number = Math.min(Math.max(index, Constants.ZERO), cellElements.length - Constants.ONE);

    cellElements[targetIndex]?.nativeElement.focus();
  }

  private firstEmptyIndex(): number {
    return this.cells().findIndex(cell => cell === Constants.EMPTY_STRING);
  }

  private toDigits(value: string): string {
    return value.replace(Constants.NOT_DIGIT_PATTERN, Constants.EMPTY_STRING).slice(
      Constants.ZERO,
      this.codeLength(),
    );
  }
}
