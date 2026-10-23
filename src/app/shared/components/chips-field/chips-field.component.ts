import { Component, computed, input, model, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal, ModelSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import type { ISelectOption } from '../../models/select-option.model';

@Component({
  selector: 'app-chips-field',
  templateUrl: './chips-field.component.html',
  styleUrl: './chips-field.component.scss',
})
export class ChipsFieldComponent<T extends string> implements FormValueControl<T[]> {
  public readonly value: ModelSignal<T[]> = model<T[]>([]);

  public readonly errors: InputSignal<readonly ValidationError.WithOptionalFieldTree[]> = input<
    readonly ValidationError.WithOptionalFieldTree[]
  >([]);

  public readonly touched: InputSignal<boolean> = input<boolean>(false);

  public readonly dirty: InputSignal<boolean> = input<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly fieldId: InputSignal<string> = input.required<string>();

  public readonly fieldLabel: InputSignal<string | null> = input<string | null>(null);

  public readonly fieldHint: InputSignal<string | null> = input<string | null>(null);

  public readonly addLabel: InputSignal<string> = input<string>(Constants.ADD_LABEL);

  public readonly options: InputSignal<readonly ISelectOption<T>[]> = input<
    readonly ISelectOption<T>[]
  >([]);

  public readonly excludedValues: InputSignal<readonly T[]> = input<readonly T[]>([]);

  public readonly maxItems: InputSignal<number | null> = input<number | null>(null);

  public readonly selectedOptions: Signal<readonly ISelectOption<T>[]> = computed(() =>
    this.value().map(
      (value: T) =>
        this.options().find((option: ISelectOption<T>) => option.value === value) ?? {
          value: value,
          label: value,
        },
    ),
  );

  public readonly availableOptions: Signal<readonly ISelectOption<T>[]> = computed(() =>
    this.options().filter(
      (option: ISelectOption<T>) =>
        !this.value().includes(option.value) && !this.excludedValues().includes(option.value),
    ),
  );

  public readonly isLimitReached: Signal<boolean> = computed(() => {
    const maxItems: number | null = this.maxItems();
    return maxItems !== null && this.value().length >= maxItems;
  });

  public readonly visibleErrors: Signal<readonly ValidationError.WithOptionalFieldTree[]> =
    computed(() => (this.touched() || this.dirty() ? this.errors() : []));

  public onAdd(event: Event): void {
    const select: HTMLSelectElement = event.target as HTMLSelectElement;
    const option: ISelectOption<T> | undefined = this.availableOptions().find(
      (candidate: ISelectOption<T>) => candidate.value === select.value,
    );

    select.value = Constants.EMPTY_STRING;

    if (option && !this.isLimitReached()) {
      this.value.update((values: T[]) => [...values, option.value]);
    }

    this.touch.emit();
  }

  public onRemove(value: T): void {
    this.value.update((values: T[]) => values.filter((item: T) => item !== value));
    this.touch.emit();
  }
}
