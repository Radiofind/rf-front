import { inject, PLATFORM_ID, Service } from "@angular/core";
import { Constants } from "../../../core/constants/constants";
import { isPlatformBrowser } from "@angular/common";
import { jwtDecode } from 'jwt-decode';

import type { IJwtPayload } from "../../../core/models/auth.model";

@Service()

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
      const decoded = jwtDecode<IJwtPayload>(token);
      return decoded.exp * Constants.MILLISECONDS_IN_ONE_SECOND > Date.now();
    } catch {
      return false
    };
  }
}
