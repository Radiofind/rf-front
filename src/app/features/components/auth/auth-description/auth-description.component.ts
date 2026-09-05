import { Component, input, type InputSignal } from '@angular/core';
import type { IAuthContent } from '../../../models/auth-content.model';
import { AUTH_DESCRIPTION_CONTENT_LOGIN } from '../../../constants/auth-content.constant';
import { IconComponent } from "../../../../shared/components/icon/icon.component";

@Component({
  selector: 'app-auth-description',
  templateUrl: './auth-description.component.html',
  styleUrl: './auth-description.component.scss',
  imports: [IconComponent],
})

export class AuthDescriptionComponent {
  public content: InputSignal<IAuthContent> = input<IAuthContent>(AUTH_DESCRIPTION_CONTENT_LOGIN);
}
