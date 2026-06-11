import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { AuthDescriptionComponent } from "../../features/components/auth/auth-description/auth-description.component";
import { AuthFormComponent } from "../../features/components/auth/auth-form/auth-form.component";
import { IAuthContent } from '../../features/models/auth-content.model';
import { AUTH_DESCRIPTION_CONTENT_LOGIN, AUTH_DESCRIPTION_CONTENT_REGISTER } from '../../features/constants/auth-content.constant';
import { AuthType } from '../../core/types/auth.type';
import { Constants } from '../../core/constants/constants';

@Component({
  selector: 'app-auth-page',
  imports: [HeaderComponent, AuthDescriptionComponent, AuthFormComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AuthPageComponent {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  public readonly authDescriptionContentLogin: IAuthContent = AUTH_DESCRIPTION_CONTENT_LOGIN;

  public readonly authDescriptionContentRegister: IAuthContent = AUTH_DESCRIPTION_CONTENT_REGISTER;

  public readonly authType: Signal<AuthType> = toSignal(
    this.activatedRoute.data.pipe(
      map(data => data[Constants.AUTH_TYPE_PROP])
    ),
    {
      initialValue: Constants.LOGIN,
    }
  )
}
