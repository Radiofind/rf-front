import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs';
import { AuthStateService } from '../../../features/services/auth-state-service/auth-state.service';
import { EndpointConstants } from '../../constants/endpoints.constants';
import { skipGlobalLoader } from '../../tokens/loader/loader.token';
import { Constants } from '../../constants/constants';

import type { Observable } from 'rxjs';
import type {
  IAuthEndpoints,
  IAuthResponse,
  IForgotPasswordData,
  ILoginData,
  IResendTwoFactorData,
  IResetPasswordData,
  IResetTokenValidResponse,
  IResetTokenValidData,
  ITwoFactorData,
  ITwoFactorResponse,
} from '../../models/auth.model';
import type { IRegisterData } from '../../../features/models/auth-content.model';
import type {
  IAvatarResponse,
  ICurrentUser,
  IUserEndpoints,
  IUserProfileData,
} from '../../models/user.model';

@Service()
export class ApiService {
  private readonly authEndpoints: IAuthEndpoints = EndpointConstants.AUTH_ENDPOINTS;

  private readonly userEndpoints: IUserEndpoints = EndpointConstants.USER_ENDPOINTS;

  private readonly authApi: string = `${environment.apiUrl}${this.authEndpoints.auth}`;

  private readonly userApi: string = `${environment.apiUrl}${this.userEndpoints.users}`;

  private readonly currentUserApi: string = `${this.userApi}${this.userEndpoints.me}`;

  private readonly http: HttpClient = inject(HttpClient);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.http
      .post<IAuthResponse>(`${this.authApi}${this.authEndpoints.register}`, data)
      .pipe(
        tap((response: IAuthResponse) => {
          this.authStateService.setToken(String(response.token));
        }),
      );
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.authApi}${this.authEndpoints.login}`, data);
  }

  public twoFactorAuth(data: ITwoFactorData): Observable<IAuthResponse> {
    return this.http
      .post<ITwoFactorResponse>(`${this.authApi}${this.authEndpoints.twoFactorAuth}`, data)
      .pipe(
        tap((response: ITwoFactorResponse) => {
          this.authStateService.setToken(response.token);
        }),
      );
  }

  public resendTwoFactorAuth(data: IResendTwoFactorData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.authApi}${this.authEndpoints.resendTwoFactorAuth}`,
      data,
      { context: skipGlobalLoader() },
    );
  }

  public forgetPassword(data: IForgotPasswordData): Observable<unknown> {
    return this.http.post(`${this.authApi}${this.authEndpoints.forgotPassword}`, data);
  }

  public resetTokenValidation(data: IResetTokenValidData): Observable<IResetTokenValidResponse> {
    return this.http.post<IResetTokenValidResponse>(
      `${this.authApi}${this.authEndpoints.validateResetToken}`,
      data,
    );
  }

  public resetPassword(data: IResetPasswordData): Observable<unknown> {
    return this.http.post(`${this.authApi}${this.authEndpoints.resetPassword}`, data);
  }

  public getCurrentUserData(): Observable<ICurrentUser> {
    return this.http.get<ICurrentUser>(this.currentUserApi);
  }

  public getUserProfileData(): Observable<IUserProfileData> {
    return this.http.get<IUserProfileData>(`${this.currentUserApi}${this.userEndpoints.profile}`);
  }

  public uploadNewAvatar(file: File): Observable<IAvatarResponse> {
    const formData: FormData = new FormData();
    formData.append(Constants.FILE_FORM_DATA, file);
    return this.http.post<IAvatarResponse>(
      `${this.currentUserApi}${this.userEndpoints.avatar}`,
      formData,
    );
  }

  public getCurrentAvatar(): Observable<Blob> {
    return this.http.get(`${this.currentUserApi}${this.userEndpoints.avatar}`, {
      responseType: 'blob',
    });
  }

  public deleteAvatar(): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.delete<void>(`${this.currentUserApi}${this.userEndpoints.avatar}`);
  }
}
