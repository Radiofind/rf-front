import { Component, input, model, output } from '@angular/core';
import { ACCENT_COLOR_OPTIONS } from '../../../constants/settings.constant';

import type { InputSignal, ModelSignal, OutputEmitterRef } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import type { AccentColor } from '../../../../core/types/accent-color.type';
import type { IAccentColorOption } from '../../../models/accent-color-option.model';

@Component({
  selector: 'app-accent-color-picker',
  templateUrl: './accent-color-picker.component.html',
  styleUrl: './accent-color-picker.component.scss',
})
export class AccentColorPickerComponent implements FormValueControl<AccentColor> {
  public readonly value: ModelSignal<AccentColor> = model.required<AccentColor>();

  public readonly options: InputSignal<readonly IAccentColorOption[]> =
    input<readonly IAccentColorOption[]>(ACCENT_COLOR_OPTIONS);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly groupName: InputSignal<string> = input<string>('accent-color');

  public readonly labelledBy: InputSignal<string | null> = input<string | null>(null);

  public readonly describedBy: InputSignal<string | null> = input<string | null>(null);

  public onSelect(option: IAccentColorOption): void {
    this.value.set(option.value);
    this.touch.emit();
  }
}
