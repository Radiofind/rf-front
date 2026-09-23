import { Component, input, output } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { ButtonTypeEnum } from '../../../core/enums/button-type.enum';

import type { OutputEmitterRef, InputSignal } from '@angular/core';
import type { ButtonType } from '../../../core/types/button-type.type';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  public readonly buttonType: InputSignal<ButtonType> = input<ButtonType>(ButtonTypeEnum.BUTTON);

  public readonly contentText: InputSignal<string | null> = input<string | null>(null);

  public readonly contentIconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly additionalClass: InputSignal<string> = input<string>(Constants.EMPTY_STRING);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly clickAction: OutputEmitterRef<void> = output();

  public onClick(): void {
    this.clickAction.emit();
  }
}
