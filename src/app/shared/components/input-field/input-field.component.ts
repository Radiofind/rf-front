import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from '../../../core/constants/constants';
import { InputType } from '../../../core/types/input-type.type';
import { AUTH_ERROR_MESSAGES } from '../../../features/constants/auth-error-messages.constant';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true,
    }
  ],
})
export class InputFieldComponent implements ControlValueAccessor {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public additionalClass: InputSignal<string | null> = input<string | null>(null);

  public fieldLabel: InputSignal<string | null> = input<string | null>(null);

  public additionalFieldLabel: InputSignal<string | null> = input<string | null>(null);

  public hasOptionalLabel: InputSignal<boolean> = input<boolean>(false);

  public minDateValue: InputSignal<string | null> = input<string | null>(null);

  public maxDateValue: InputSignal<string | null> = input<string | null>(null);

  public iconClass: InputSignal<string | null> = input<string | null>(null);

  public inputClass: InputSignal<string | null> = input<string | null>(null);

  public inputType: InputSignal<InputType> = input<InputType>(Constants.INPUT_DEFAULT_TYPE);

  public inputPlaceholder: InputSignal<string | null> = input<string | null>(null);

  public hasInputAction: InputSignal<boolean> = input<boolean>(false);

  public inputActionIconClass: InputSignal<string | null> = input<string | null>(null);

  public inputControl: InputSignal<AbstractControl> = input.required<AbstractControl>();

  public errorFormControl: InputSignal<AbstractControl | null> = input<AbstractControl | null>(null);

  public inputActionEmiter: OutputEmitterRef<void> = output<void>();

  public inputValue: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public isInputTouched: WritableSignal<boolean> = signal<boolean>(false);

  public inputControlStatus: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public inputErrorsMapper: Record<string, string> = AUTH_ERROR_MESSAGES;

  public isInputInvalid: Signal<boolean | undefined> = computed(() => {
    const control: AbstractControl = this.inputControl();
    const errorFormControl: AbstractControl | null = this.errorFormControl();
    this.inputControlStatus();
    return (this.isInputTouched() && control.invalid) || (this.isInputTouched() && errorFormControl?.invalid);
  })

  public inputErrorMessages: Signal<string[]> = computed(() => {
    const control: AbstractControl = this.inputControl();
    const errorFormControl: AbstractControl | null = this.errorFormControl();
    this.inputControlStatus();

    const errors: ValidationErrors = {
      ...control.errors,
      ...errorFormControl?.errors,
    };

    if (!this.isInputTouched() || !Object.keys(errors).length) {
      return [];
    }
    return Object.keys(errors).map(error => this.inputErrorsMapper[error]).filter(Boolean);
  });

  constructor() {
    effect(() => {
      const control: AbstractControl = this.inputControl();
      control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.inputControlStatus.set(control.status);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = (value: string) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  public writeValue(value: string): void {
    this.inputValue.set(value ?? Constants.EMPTY_STRING);
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public onInput(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;

    this.inputValue.set(value);
    this.onChange(value);
  }

  public onBlur(): void {
    this.isInputTouched.set(true);
    this.onTouched();
  }

  public onHandleInputAction(): void {
    this.inputActionEmiter.emit();
  }
}
