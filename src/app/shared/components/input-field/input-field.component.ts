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
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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

  public iconClass: InputSignal<string | null> = input<string | null>(null);

  public inputType: InputSignal<InputType> = input<InputType>(Constants.INPUT_DEFAULT_TYPE);

  public inputPlaceholder: InputSignal<string | null> = input<string | null>(null);

  public hasInputAction: InputSignal<boolean> = input<boolean>(false);

  public inputActionIconClass: InputSignal<string | null> = input<string | null>(null);

  public inputControl: InputSignal<AbstractControl> = input.required<AbstractControl>();

  public inputActionEmiter: OutputEmitterRef<void> = output<void>();

  public inputValue: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public isInputTouched: WritableSignal<boolean> = signal<boolean>(false);

  public inputControlStatus: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public inputErrorsMapper: Record<string, string> = AUTH_ERROR_MESSAGES;

  public isInputInvalid: Signal<boolean> = computed(() => {
    const control: AbstractControl = this.inputControl();
    this.inputControlStatus();
    return this.isInputTouched() && control.invalid;
  })

  public inputErrorMessages: Signal<string[]> = computed(() => {
    const control: AbstractControl = this.inputControl();
    this.inputControlStatus();
    if (!this.isInputTouched() || !control.errors) {
      return [];
    }
    return Object.keys(control.errors).map(error => this.inputErrorsMapper[error]).filter(Boolean);
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
