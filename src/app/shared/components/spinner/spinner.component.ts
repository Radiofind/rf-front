import { Component, input } from '@angular/core';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  host: {
    '[style.--spinner-size]': 'size()',
    '[style.--spinner-thickness]': 'thickness()',
  },
})
export class SpinnerComponent {
  public readonly size: InputSignal<string> = input<string>(Constants.SPINNER_DEFAULT_SIZE);

  public readonly thickness: InputSignal<string> = input<string>(
    Constants.SPINNER_DEFAULT_THICKNESS,
  );

  public readonly ariaLabel: InputSignal<string> = input<string>(Constants.SPINNER_ARIA_LABEL);
}
