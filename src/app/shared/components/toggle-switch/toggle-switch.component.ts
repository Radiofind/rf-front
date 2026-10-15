import { Component, computed, input, model, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal, ModelSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.scss',
})
export class ToggleSwitchComponent implements FormCheckboxControl {
  public readonly checked: ModelSignal<boolean> = model<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly checkedText: InputSignal<string> = input<string>(Constants.TOGGLE_ENABLED_TEXT);

  public readonly uncheckedText: InputSignal<string> = input<string>(
    Constants.TOGGLE_DISABLED_TEXT,
  );

  public readonly labelledBy: InputSignal<string | null> = input<string | null>(null);

  public readonly describedBy: InputSignal<string | null> = input<string | null>(null);

  protected readonly stateText: Signal<string> = computed<string>(() =>
    this.checked() ? this.checkedText() : this.uncheckedText(),
  );

  public onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
    this.touch.emit();
  }
}
