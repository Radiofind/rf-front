import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user-service/user.service';
import { Constants } from '../../../core/constants/constants';

import type { Signal, WritableSignal } from '@angular/core';

@Service()
export class AvatarStateService {
  private readonly userService: UserService = inject(UserService);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly avatarUrlState: WritableSignal<string | null> = signal<string | null>(null);

  private requestId: number = Constants.ZERO;

  public readonly avatarUrl: Signal<string | null> = this.avatarUrlState.asReadonly();

  public async loadAvatar(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.requestId += Constants.ONE;
    const requestId: number = this.requestId;

    const avatar: Blob | null = await this.fetchAvatar();

    if (requestId === this.requestId) {
      this.applyAvatar(avatar);
    }
  }

  public setAvatar(avatar: Blob | null): void {
    this.requestId += Constants.ONE;
    this.applyAvatar(avatar);
  }

  public clear(): void {
    this.setAvatar(null);
  }

  private async fetchAvatar(): Promise<Blob | null> {
    try {
      return await firstValueFrom(this.userService.getCurrentAvatar());
    } catch {
      return null;
    }
  }

  private applyAvatar(avatar: Blob | null): void {
    const previousAvatarUrl: string | null = this.avatarUrlState();

    if (previousAvatarUrl) {
      URL.revokeObjectURL(previousAvatarUrl);
    }

    this.avatarUrlState.set(avatar ? URL.createObjectURL(avatar) : null);
  }
}
