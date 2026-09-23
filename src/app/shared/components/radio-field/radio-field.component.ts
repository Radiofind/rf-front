import { Component, input, model, output } from '@angular/core';

import type { OutputEmitterRef, InputSignal, ModelSignal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-radio-field',
  templateUrl: './radio-field.component.html',
  styleUrl: './radio-field.component.scss',
})
export class RadioFieldComponent<T extends string> implements FormValueControl<T> {
  public readonly value: ModelSignal<T> = model.required<T>();

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly fieldLabel: InputSignal<string | null> = input<string | null>(null);

  public readonly options: InputSignal<readonly T[]> = input<readonly T[]>([]);

  public onChange(option: T): void {
    this.value.set(option);
    this.touch.emit();
  }
}
