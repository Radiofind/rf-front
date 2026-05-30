import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { IAuthEndpoints, IAuthModel, IAuthResponse } from "../models/auth.model";
import { Observable, tap } from "rxjs";
import { AuthStateService } from "./auth-state.service";
import { AUTH_ENDPOINTS } from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authEndpoints: IAuthEndpoints = AUTH_ENDPOINTS;
  private readonly api: string = `${environment.apiUrl}${this.authEndpoints.auth}`;
  private readonly http: HttpClient = inject(HttpClient);
  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IAuthModel): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.api}${this.authEndpoints.register}`, data).pipe(
      tap((response: IAuthResponse) => {
        this.authStateService.setToken(response.token);
      })
    );
  }

  public login(data: IAuthModel): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.api}${this.authEndpoints.login}`, data).pipe(
      tap((response: IAuthResponse) => {
        this.authStateService.setToken(response.token);
      })
    );
  }

  public logout(): void {
    this.authStateService.clearToken();
  }
}