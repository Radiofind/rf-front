import { Component, computed, input, model, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { InputTypeEnum } from '../../../core/enums/input-type.enum';

import type { OutputEmitterRef, InputSignal, ModelSignal, Signal } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import type { InputType } from '../../../core/types/input-type.type';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
})
export class InputFieldComponent implements FormValueControl<string> {
  public readonly value: ModelSignal<string> = model<string>(Constants.EMPTY_STRING);

  public readonly errors: InputSignal<readonly ValidationError.WithOptionalFieldTree[]> =
    input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  public readonly touched: InputSignal<boolean> = input<boolean>(false);

  public readonly dirty: InputSignal<boolean> = input<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly required: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly additionalClass: InputSignal<string | null> = input<string | null>(null);

  public readonly fieldLabel: InputSignal<string | null> = input<string | null>(null);

  public readonly additionalFieldLabel: InputSignal<string | null> = input<string | null>(null);

  public readonly hasOptionalLabel: InputSignal<boolean> = input<boolean>(false);

  public readonly iconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly inputClass: InputSignal<string | null> = input<string | null>(null);

  public readonly inputType: InputSignal<InputType> = input<InputType>(InputTypeEnum.TEXT);

  public readonly inputPlaceholder: InputSignal<string | null> = input<string | null>(null);

  public readonly hasInputAction: InputSignal<boolean> = input<boolean>(false);

  public readonly inputActionIconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly isTextareaField: InputSignal<boolean> = input<boolean>(false);

  public readonly textareaRows: InputSignal<number> = input<number>(Constants.DEFAULT_TEXTAREA_ROWS);

  public readonly inputActionEmiter: OutputEmitterRef<void> = output();

  public readonly visibleErrors: Signal<readonly ValidationError.WithOptionalFieldTree[]> = computed(() =>
    this.touched() || this.dirty() ? this.errors() : []
  );

  public readonly isInputInvalid: Signal<boolean> = computed(() => this.visibleErrors().length > Constants.ZERO);

  public onInput(event: Event): void {
    const input: HTMLInputElement | HTMLTextAreaElement = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(input.value);
  }

  public onHandleInputAction(): void {
    this.inputActionEmiter.emit();
  }
}
