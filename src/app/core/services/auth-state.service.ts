import { Injectable } from "@angular/core";
import { TOKEN_KEY } from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly tokenKey = TOKEN_KEY;

  public setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }
}