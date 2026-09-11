import { inject, Service } from "@angular/core";
import { AuthStateService } from "../auth-state-service/auth-state.service";
import { ApiService } from "../../../core/services/api.service";

import type { Observable } from "rxjs";
import type { IAuthResponse, ILoginData, ITwoFactorData } from "../../../core/models/auth.model";
import type { IRegisterData } from "../../models/auth-content.model";

@Service()

export class AuthService {
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

  public logout(): void {
    this.authStateService.clearToken();
  }
}
