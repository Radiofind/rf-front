import {
  Component,
  input,
  type InputSignal,
  model,
  type ModelSignal,
  output,
  OutputEmitterRef
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';

@Component({
  selector: 'app-checkbox-field',
  templateUrl: './checkbox-field.component.html',
  styleUrl: './checkbox-field.component.scss',
})
export class CheckboxFieldComponent implements FormCheckboxControl {
  public readonly checked: ModelSignal<boolean> = model<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly touch: OutputEmitterRef<void> = output<void>();

  public readonly checkboxText: InputSignal<string | null> = input<string | null>(null);

  public onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
    this.touch.emit();
  }
}
