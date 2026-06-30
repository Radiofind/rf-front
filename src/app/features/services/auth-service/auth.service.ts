import { inject, Injectable } from "@angular/core";
import { IAuthResponse, ILoginData } from "../../../core/models/auth.model";
import { Observable } from "rxjs";
import { AuthStateService } from "../auth-state-service/auth-state.service";
import { IRegisterData } from "../../models/auth-content.model";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly apiService: ApiService = inject(ApiService);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.apiService.register(data);
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.apiService.login(data);
  }

  public logout(): void {
    this.authStateService.clearToken();
  }
}
