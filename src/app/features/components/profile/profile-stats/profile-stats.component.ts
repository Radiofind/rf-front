import { Component, input } from '@angular/core';
import { Constants } from '../../../../core/constants/constants';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

import type { InputSignal } from '@angular/core';
import type { TranslationKey } from '../../../../core/types/translation.type';

@Component({
  selector: 'app-profile-stats',
  templateUrl: './profile-stats.component.html',
  styleUrl: './profile-stats.component.scss',
  imports: [TranslatePipe],
})
export class ProfileStatsComponent {
  public readonly registeredAt: InputSignal<string> = input<string>(Constants.DASH);

  public readonly uploadsCount: InputSignal<string> = input<string>(Constants.DASH);

  public readonly uploadsLabel: InputSignal<TranslationKey> =
    input<TranslationKey>('profile.uploads');

  public readonly followersCount: InputSignal<string> = input<string>(Constants.DASH);

  public readonly likesCount: InputSignal<string> = input<string>(Constants.DASH);
}
