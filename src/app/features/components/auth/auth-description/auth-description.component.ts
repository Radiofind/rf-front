import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { IAuthContent } from '../../../models/auth-content.model';
import { AUTH_DESCRIPTION_CONTENT_LOGIN } from '../../../constants/auth-content.constant';

@Component({
  selector: 'app-auth-description',
  templateUrl: './auth-description.component.html',
  styleUrl: './auth-description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthDescriptionComponent {
  public content: InputSignal<IAuthContent> = input<IAuthContent>(AUTH_DESCRIPTION_CONTENT_LOGIN);
}
