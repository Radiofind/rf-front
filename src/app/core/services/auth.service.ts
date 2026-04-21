import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { AuthModel, AuthResponse } from "../models/auth.model";
import { Observable, tap } from "rxjs";
import { AuthStateService } from "./auth-state.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);
  private readonly authStateService = inject(AuthStateService);

  public register(data: AuthModel): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, data).pipe(
      tap(response => {
        this.authStateService.setToken(response.token);
      })
    );
  }

  public login(data: AuthModel): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
      tap(response => {
        this.authStateService.setToken(response.token);
      })
    );
  }

  public logout(): void {
    this.authStateService.clearToken();
  }
}