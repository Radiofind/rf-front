import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Constants } from '../../../core/constants/constants';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownTriggerDirective } from '../../directives/dropdown-trigger/dropdown-trigger.directive';
import { findSelectOption } from '../../helpers/select-option/select-option.helpers';

import type {
  InputSignal,
  ModelSignal,
  OutputEmitterRef,
  Signal,
  WritableSignal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import type { ISelectOption } from '../../models/select-option.model';

@Component({
  selector: 'app-select-field',
  imports: [DropdownMenuComponent, DropdownTriggerDirective],
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

  public readonly placeholder: InputSignal<string> = input<string>(Constants.EMPTY_STRING);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly labelledBy: InputSignal<string | null> = input<string | null>(null);

  public readonly describedBy: InputSignal<string | null> = input<string | null>(null);

  public readonly controlId: string = inject(_IdGenerator).getId(Constants.SELECT_FIELD_ID_PREFIX);

  public readonly ariaLabelledBy: Signal<string | null> = computed(() => {
    const labelledBy: string | null = this.labelledBy();
    return labelledBy ? `${labelledBy} ${this.controlId}` : null;
  });

  public readonly selectedOption: Signal<ISelectOption<T> | undefined> = computed(() =>
    findSelectOption(this.options(), this.value()),
  );

  private readonly isOpenState: WritableSignal<boolean> = signal<boolean>(false);

  public readonly isOpen: Signal<boolean> = this.isOpenState.asReadonly();

  public onOpen(): void {
    this.isOpenState.set(true);
  }

  public onClose(): void {
    this.isOpenState.set(false);
    this.touch.emit();
  }

  public onSelect(value: T): void {
    if (findSelectOption(this.options(), value)) {
      this.value.set(value);
    }
  }
}
