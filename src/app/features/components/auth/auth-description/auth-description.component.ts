import { Component, input } from '@angular/core';
import { AUTH_DESCRIPTION_CONTENT_LOGIN } from '../../../constants/auth-content.constant';
import { IconComponent } from "../../../../shared/components/icon/icon.component";

import type { InputSignal } from '@angular/core';
import type { IAuthContent } from '../../../models/auth-content.model';

@Component({
  selector: 'app-auth-description',
  templateUrl: './auth-description.component.html',
  styleUrl: './auth-description.component.scss',
  imports: [IconComponent],
})

export class AuthDescriptionComponent {
  public content: InputSignal<IAuthContent> = input<IAuthContent>(AUTH_DESCRIPTION_CONTENT_LOGIN);
}
