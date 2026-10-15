import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SETTINGS_NAV_ITEMS } from '../../../features/constants/settings.constant';

import type { ISettingsNavItem } from '../../../features/models/settings-nav-item.model';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
})
export class SettingsPageComponent {
  protected readonly navItems: readonly ISettingsNavItem[] = SETTINGS_NAV_ITEMS;
}
