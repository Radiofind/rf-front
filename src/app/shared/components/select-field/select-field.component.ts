import { Component, input, model, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import type { ISelectOption } from '../../models/select-option.model';

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss',
})
export class SelectFieldComponent<T extends string> implements FormValueControl<T> {
  public readonly value: ModelSignal<T> = model.required<T>();

  public readonly options: InputSignal<readonly ISelectOption<T>[]> = input<
    readonly ISelectOption<T>[]
  >([]);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly name: InputSignal<string> = input<string>(Constants.EMPTY_STRING);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly labelledBy: InputSignal<string | null> = input<string | null>(null);

  public readonly describedBy: InputSignal<string | null> = input<string | null>(null);

  public onChange(event: Event): void {
    const selected: string = (event.target as HTMLSelectElement).value;
    const option: ISelectOption<T> | undefined = this.options().find(
      (candidate: ISelectOption<T>) => candidate.value === selected,
    );

    if (option) {
      this.value.set(option.value);
    }

    this.touch.emit();
  }
}
