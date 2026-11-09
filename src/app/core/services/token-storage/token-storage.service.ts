import { inject, PLATFORM_ID, Service } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../constants/constants';

@Service()
export class TokenStorageService {
  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  public read(): string | null {
    return this.isBrowser ? localStorage.getItem(Constants.TOKEN_KEY) : null;
  }

  public write(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(Constants.TOKEN_KEY, token);
    }
  }

  public clear(): void {
    if (this.isBrowser) {
      localStorage.removeItem(Constants.TOKEN_KEY);
    }
  }
}
