import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Constants } from "../constants/constants";
import { isPlatformBrowser } from "@angular/common";
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from "../models/auth.model";

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly tokenKey = Constants.TOKEN_KEY;
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

  public isTokenValid(): boolean {
    const token: string | null | undefined = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false
    };
  }
}