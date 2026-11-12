import { inject, Service } from '@angular/core';
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
  ITwoFactorResponse,
} from '../../../core/models/auth.model';
import type { IRegisterData } from '../../models/auth-content.model';

@Service()
export class AuthService {
  private readonly apiService: ApiService = inject(ApiService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.apiService.register(data);
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.apiService.login(data);
  }

  public twoFactorAuth(data: ITwoFactorData): Observable<ITwoFactorResponse> {
    return this.apiService.twoFactorAuth(data);
  }

  public verifyBackupCode(data: ITwoFactorData): Observable<ITwoFactorResponse> {
    return this.apiService.verifyBackupCode(data);
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
}
