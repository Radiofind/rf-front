import { Component, input } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { TranslatePipe } from '../../pipes/translate/translate.pipe';

import type { InputSignal } from '@angular/core';
import type { TranslationKey } from '../../../core/types/translation.type';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  imports: [TranslatePipe],
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

  public readonly ariaLabel: InputSignal<TranslationKey> = input<TranslationKey>(
    Constants.SPINNER_ARIA_LABEL,
  );
}
