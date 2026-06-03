import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { AuthDescriptionComponent } from "../../features/components/auth/auth-description/auth-description.component";
import { AuthFormComponent } from "../../features/components/auth/auth-form/auth-form.component";
import { IAuthContent } from '../../features/models/auth-content.model';
import { AUTH_DESCRIPTION_CONTENT_LOGIN, AUTH_DESCRIPTION_CONTENT_REGISTER } from '../../features/constants/auth-content.constant';

@Component({
  selector: 'app-auth-page',
  imports: [HeaderComponent, AuthDescriptionComponent, AuthFormComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPageComponent {
  public isLogin: WritableSignal<boolean> = signal<boolean>(true);

  public readonly authDescriptionContentLogin: IAuthContent = AUTH_DESCRIPTION_CONTENT_LOGIN;

  public readonly authDescriptionContentRegister: IAuthContent = AUTH_DESCRIPTION_CONTENT_REGISTER;
}
