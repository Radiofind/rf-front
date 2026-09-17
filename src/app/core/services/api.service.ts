import { inject, Service } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { AuthStateService } from "../../features/services/auth-state-service/auth-state.service";
import { EndpointConstants } from "../constants/endpoints.constants";
import { skipGlobalLoader } from "../tokens/loader.token";

import type { Observable } from "rxjs";
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
  ITwoFactorResponse
} from "../models/auth.model";
import type { IRegisterData } from "../../features/models/auth-content.model";

@Service()

export class ApiService {
  private readonly authEndpoints: IAuthEndpoints = EndpointConstants.AUTH_ENDPOINTS;

  private readonly api: string = `${environment.apiUrl}${this.authEndpoints.auth}`;

  private readonly http: HttpClient = inject(HttpClient);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.api}${this.authEndpoints.register}`, data).pipe(
      tap((response: IAuthResponse) => {
        this.authStateService.setToken(String(response.token));
      })
    );
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.api}${this.authEndpoints.login}`, data);
  }

  public twoFactorAuth(data: ITwoFactorData): Observable<IAuthResponse> {
    return this.http.post<ITwoFactorResponse>(`${this.api}${this.authEndpoints.twoFactorAuth}`, data).pipe(
      tap((response: ITwoFactorResponse) => {
        this.authStateService.setToken(response.token);
      })
    );
  }

  public resendTwoFactorAuth(data: IResendTwoFactorData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.api}${this.authEndpoints.resendTwoFactorAuth}`,
      data,
      { context: skipGlobalLoader() },
    );
  }

  public forgetPassword(data: IForgotPasswordData): Observable<unknown> {
    return this.http.post(`${this.api}${this.authEndpoints.forgotPassword}`, data);
  }

  public resetTokenValidation(data: IResetTokenValidData): Observable<IResetTokenValidResponse> {
    return this.http.post<IResetTokenValidResponse>(`${this.api}${this.authEndpoints.validateResetToken}`, data);
  }

  public resetPassword(data: IResetPasswordData): Observable<unknown> {
    return this.http.post(`${this.api}${this.authEndpoints.resetPassword}`, data);
  }
}
