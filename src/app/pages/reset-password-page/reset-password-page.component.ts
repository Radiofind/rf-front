import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants } from '../../core/constants/constants';
import { AuthService } from '../../features/services/auth-service/auth.service';

import type { OnInit, WritableSignal } from '@angular/core';
import type { IResetTokenValidResponse } from '../../core/models/auth.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly authService: AuthService = inject(AuthService);

  public currentResetToken: WritableSignal<string | null> = signal(null);

  public isTokenValid: WritableSignal<boolean> = signal(false);

  public ngOnInit(): void {
    this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      params => {
        this.currentResetToken.set(params.get(Constants.TOKEN));
      }
    )
    void this.getResetTokenValidationResult();
  }

  private async getResetTokenValidationResult(): Promise<void> {
    const validationResult: IResetTokenValidResponse = await firstValueFrom(this.authService.resetTokenValidation({
      token: this.currentResetToken(),
    }));
    this.isTokenValid.set(validationResult.valid);
  }
}
