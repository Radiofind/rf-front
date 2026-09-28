import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '../auth-state-service/auth-state.service';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type {
  IAuthResponse,
  IForgotPasswordData,
  ILoginData,
  IResendTwoFactorData,
  IResetPasswordData,
  IResetTokenValidData,
  IResetTokenValidResponse,
  ITwoFactorData,
} from '../../../core/models/auth.model';
import type { IRegisterData } from '../../models/auth-content.model';
import { Links } from '../../../core/constants/links';

@Service()
export class AuthService {
  private readonly router: Router = inject(Router);

  private readonly apiService: ApiService = inject(ApiService);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.apiService.register(data);
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.apiService.login(data);
  }

  public twoFactorAuth(data: ITwoFactorData): Observable<IAuthResponse> {
    return this.apiService.twoFactorAuth(data);
  }

  public resendTwoFactorAuth(data: IResendTwoFactorData): Observable<IAuthResponse> {
    return this.apiService.resendTwoFactorAuth(data);
  }

  public forgetPassword(data: IForgotPasswordData): Observable<unknown> {
    return this.apiService.forgetPassword(data);
  }

  public resetTokenValidation(data: IResetTokenValidData): Observable<IResetTokenValidResponse> {
    return this.apiService.resetTokenValidation(data);
  }

  public resetPassword(data: IResetPasswordData): Observable<unknown> {
    return this.apiService.resetPassword(data);
  }

  public logout(): void {
    this.authStateService.clearToken();
    void this.router.navigate([Links.LOGIN_URL]);
  }
}
