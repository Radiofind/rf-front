import type { OutputEmitterRef } from '@angular/core';
import {
  Component,
  computed,
  input,
  type InputSignal,
  model,
  type ModelSignal,
  output,
  type Signal,
} from '@angular/core';
import {
  type FormValueControl,
  transformedValue,
  type TransformedValueSignal,
  type ValidationError
} from '@angular/forms/signals';
import { Constants } from '../../../core/constants/constants';
import { AuthValidationMessages } from '../../../features/constants/auth-error-messages.constant';
import { transformDateToString, transformStringToDate } from '../../helpers/date.helpers';

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss',
})
export class DateFieldComponent implements FormValueControl<Date | null> {
  public readonly value: ModelSignal<Date | null> = model<Date | null>(null);

  public readonly errors: InputSignal<readonly ValidationError.WithOptionalFieldTree[]> =
    input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  public readonly touched: InputSignal<boolean> = input<boolean>(false);

  public readonly dirty: InputSignal<boolean> = input<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly required: InputSignal<boolean> = input<boolean>(false);

  public readonly min: InputSignal<Date | undefined> = input<Date | undefined>(undefined);

  public readonly max: InputSignal<Date | undefined> = input<Date | undefined>(undefined);

  public readonly touch: OutputEmitterRef<void> = output();

  public readonly fieldLabel: InputSignal<string | null> = input<string | null>(null);

  public readonly iconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly inputPlaceholder: InputSignal<string | null> = input<string | null>(null);

  public readonly rawValue: TransformedValueSignal<string> = transformedValue(this.value, {
    parse: (raw: string) => {
      if (!raw) {
        return { value: null };
      };

      const parsed: Date = transformStringToDate(raw);

      return isNaN(parsed.getTime())
        ? { error: { kind: Constants.INVALID_DATE, message: AuthValidationMessages.INVALID_DATE } }
        : { value: parsed };
    },
    format: (date: Date | null) => (date ? transformDateToString(date) : Constants.EMPTY_STRING),
  });

  public readonly minValue: Signal<string | null> = computed(() => {
    const min: Date | undefined = this.min();
    return min ? transformDateToString(min) : null;
  });

  public readonly maxValue: Signal<string | null> = computed(() => {
    const max: Date | undefined = this.max();
    return max ? transformDateToString(max) : null;
  });

  public readonly visibleErrors: Signal<readonly ValidationError.WithOptionalFieldTree[]> = computed(() =>
    this.touched() || this.dirty() ? this.errors() : []
  );

  public readonly isInputInvalid: Signal<boolean> = computed(() => this.visibleErrors().length > Constants.ZERO);

  public onInput(event: Event): void {
    this.rawValue.set((event.target as HTMLInputElement).value);
  }
}
