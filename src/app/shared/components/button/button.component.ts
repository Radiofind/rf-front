import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { ButtonType } from '../../../core/types/button-type.type';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ButtonComponent {
  public readonly buttonType: InputSignal<ButtonType> = input<ButtonType>('button');

  public readonly contentText: InputSignal<string | null> = input<string | null>(null);

  public readonly contentIconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly additionalClass: InputSignal<string> = input<string>('');

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly clickAction: OutputEmitterRef<void> = output<void>();

  public onClick(): void {
    this.clickAction.emit();
  }
}
