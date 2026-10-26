import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

@Component({
  selector: 'app-account-settings-page',
  templateUrl: './account-settings-page.component.html',
  styleUrl: './account-settings-page.component.scss',
  imports: [TranslatePipe],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AccountSettingsPageComponent {}
