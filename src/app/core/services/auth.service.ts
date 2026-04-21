import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { AuthModel } from "../models/auth.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);

  public register(data: AuthModel): Observable<unknown> {
    return this.http.post(`${this.api}/register`, data);
  }

  public login(data: AuthModel): Observable<unknown> {
    return this.http.post<{token: string}>(`${this.api}/login`, data);
  }
}