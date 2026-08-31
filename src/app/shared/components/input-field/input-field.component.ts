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
import { 
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidationErrors 
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from '../../../core/constants/constants';
import { InputType } from '../../../core/types/input-type.type';
import { AUTH_ERROR_MESSAGES } from '../../../features/constants/auth-error-messages.constant';
import { InputTypeEnum } from '../../../core/enums/input-type.enum';

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

  public inputType: InputSignal<InputType> = input<InputType>(InputTypeEnum.TEXT);

  public inputPlaceholder: InputSignal<string | null> = input<string | null>(null);

  public hasInputAction: InputSignal<boolean> = input<boolean>(false);

  public inputActionIconClass: InputSignal<string | null> = input<string | null>(null);

  public inputControl: InputSignal<AbstractControl> = input.required<AbstractControl>();

  public errorFormControl: InputSignal<AbstractControl | null> = input<AbstractControl | null>(null);

  public checkboxText: InputSignal<string | null> = input<string | null>(null);

  public radioOptions: InputSignal<string[]> = input<string[]>([]);

  public isTextareaField: InputSignal<boolean> = input<boolean>(false);

  public textareaRows: InputSignal<number> = input<number>(Constants.DEFAULT_TEXTAREA_ROWS);

  public inputActionEmiter: OutputEmitterRef<void> = output<void>();

  public inputValue: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public checkboxValue: WritableSignal<boolean> = signal<boolean>(false);

  public validationState: WritableSignal<number> = signal<number>(Constants.ZERO);

  public radioValue: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public isInputInteracted: WritableSignal<boolean> = signal<boolean>(false);

  public inputErrorsMapper: Record<string, string> = AUTH_ERROR_MESSAGES;

  public isInputInvalid: Signal<boolean | undefined> = computed(() => {
    this.validationState();

    const control: AbstractControl = this.inputControl();
    const errorFormControl: AbstractControl | null = this.errorFormControl();

    if (!this.isInputInteracted()) {
      return false;
    }

    return control.invalid || !!errorFormControl?.invalid;
  })

  public inputErrorMessages: Signal<string[]> = computed(() => {
    this.validationState();

    const control: AbstractControl = this.inputControl();
    const errorFormControl: AbstractControl | null = this.errorFormControl();

    if (!this.isInputInteracted()) {
      return [];
    }

    const errors: ValidationErrors = {
      ...control.errors,
      ...errorFormControl?.errors,
    };

    if (!this.isInputInteracted() || !Object.keys(errors).length) {
      return [];
    }
    return Object.keys(errors).map(error => this.inputErrorsMapper[error]).filter(Boolean);
  });

  constructor() {
    effect(() => {
      const control: AbstractControl = this.inputControl();
      const errorFormControl: AbstractControl | null = this.errorFormControl();

      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.validationState.update(value => value + 1);
      });

      control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.validationState.update(value => value + 1);
      });

      if (errorFormControl) {
        errorFormControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.validationState.update(value => value + 1);
        });

        errorFormControl.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.validationState.update(value => value + 1);
        });
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  private onChange: (value: string | boolean) => void = (value: string | boolean) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  public writeValue(value: string | boolean): void {
    if (this.inputType() === InputTypeEnum.CHECKBOX) {
      this.checkboxValue.set(Boolean(value))
      return;
    }

    if (this.inputType() === InputTypeEnum.RADIO) {
      this.radioValue.set(value as string ?? Constants.EMPTY_STRING);
      return;
    };
    this.inputValue.set(value as string ?? Constants.EMPTY_STRING);
  }

  public registerOnChange(fn: (value: string | boolean) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public onInput(event: Event): void {
    this.isInputInteracted.set(true);

    const input: HTMLInputElement | HTMLTextAreaElement = event.target as HTMLInputElement | HTMLTextAreaElement;

    if (this.inputType() === InputTypeEnum.CHECKBOX) {
      const checkboxInput: HTMLInputElement = input as HTMLInputElement;
      this.checkboxValue.set(checkboxInput.checked);
      this.onChange(checkboxInput.checked);
    } else {
      if (this.inputType() === InputTypeEnum.RADIO) {
        this.radioValue.set(input.value)
      } else {
        this.inputValue.set(input.value);
      }
      this.onChange(input.value);
    }
    this.onTouched();
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onHandleInputAction(): void {
    this.inputActionEmiter.emit();
  }
}
