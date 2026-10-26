import { Component, computed, input, model, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownTriggerDirective } from '../../directives/dropdown-trigger/dropdown-trigger.directive';
import {
  filterSelectOptions,
  findSelectOption,
} from '../../helpers/select-option/select-option.helpers';

import type { InputSignal, ModelSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import type { ISelectOption } from '../../models/select-option.model';

@Component({
  selector: 'app-chips-field',
  imports: [DropdownMenuComponent, DropdownTriggerDirective],
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

  public readonly isReadonly: InputSignal<boolean> = input<boolean>(false);

  public readonly selectedOptions: Signal<readonly ISelectOption<T>[]> = computed(() =>
    this.value().map(
      (value: T) =>
        findSelectOption(this.options(), value) ?? {
          value: value,
          label: value,
        },
    ),
  );

  public readonly availableOptions: Signal<readonly ISelectOption<T>[]> = computed(() =>
    filterSelectOptions(
      this.options(),
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

  public onAdd(value: T): void {
    if (findSelectOption(this.availableOptions(), value) && !this.isLimitReached()) {
      this.value.update((values: T[]) => [...values, value]);
    }
  }

  public onRemove(value: T): void {
    this.value.update((values: T[]) => values.filter((item: T) => item !== value));
    this.touch.emit();
  }
}
