import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../core/constants/constants';
import { AuthService } from '../../features/services/auth-service/auth.service';

import type { OnInit, WritableSignal } from '@angular/core';
import type { IResetTokenValidResponse } from '../../core/models/auth.model';
import { Links } from '../../core/constants/links';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly router: Router = inject(Router);

  private readonly authService: AuthService = inject(AuthService);

  public currentResetToken: WritableSignal<string | null> = signal<string | null>(null);

  public isTokenValid: WritableSignal<boolean> = signal<boolean>(false);

  public ngOnInit(): void {
    this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      params => {
        this.currentResetToken.set(params.get(Constants.TOKEN));
        void this.validateResetToken();
      }
    )
  }

  private async validateResetToken(): Promise<void> {
    const token: string | null = this.currentResetToken();
    if (!token) {
      void this.router.navigate([Links.NOT_FOUND_URL]);
      return;
    }

    try {
      const validationResult: IResetTokenValidResponse = await firstValueFrom(this.authService.resetTokenValidation({
        token,
      }));
      this.isTokenValid.set(validationResult.valid);
    } catch {
      this.isTokenValid.set(false);
    }

    if (!this.isTokenValid()) {
      void this.router.navigate([Links.NOT_FOUND_URL]);
    }
  }
}
