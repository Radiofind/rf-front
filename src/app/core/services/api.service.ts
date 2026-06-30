import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { IAuthEndpoints, IAuthResponse, ILoginData } from "../models/auth.model";
import { Observable, tap } from "rxjs";
import { AuthStateService } from "../../features/services/auth-state-service/auth-state.service";
import { EndpointConstants } from "../constants/endpoints.constants";
import { IRegisterData } from "../../features/models/auth-content.model";

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private readonly authEndpoints: IAuthEndpoints = EndpointConstants.AUTH_ENDPOINTS;
  
  private readonly api: string = `${environment.apiUrl}${this.authEndpoints.auth}`;

  private readonly http: HttpClient = inject(HttpClient);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.api}${this.authEndpoints.register}`, data).pipe(
      tap((response: IAuthResponse) => {
        this.authStateService.setToken(response.token);
      })
    );
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.api}${this.authEndpoints.login}`, data).pipe(
      tap((response: IAuthResponse) => {
        this.authStateService.setToken(response.token);
      })
    );
  }
}
