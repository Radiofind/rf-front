import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { TOKEN_KEY } from "../constants/constants";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly tokenKey = TOKEN_KEY;
  private platformId = inject(PLATFORM_ID);

  public setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  public getToken(): string | null | undefined {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return;
  }

  public clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }
}