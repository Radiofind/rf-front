import { Component, input } from '@angular/core';
import { Constants } from '../../../../core/constants/constants';

import type { InputSignal } from '@angular/core';

@Component({
  selector: 'app-profile-stats',
  templateUrl: './profile-stats.component.html',
  styleUrl: './profile-stats.component.scss',
})
export class ProfileStatsComponent {
  public readonly registeredAt: InputSignal<string> = input<string>(Constants.DASH);
}
