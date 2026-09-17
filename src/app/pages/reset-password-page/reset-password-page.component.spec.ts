import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DeferBlockBehavior } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordPageComponent } from './reset-password-page.component';
import { AuthService } from '../../features/services/auth-service/auth.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../core/constants/constants';
import { Links } from '../../core/constants/links';

import type { ComponentFixture } from '@angular/core/testing';
import type { Params } from '@angular/router';

describe('ResetPasswordPageComponent', () => {
  let fixture: ComponentFixture<ResetPasswordPageComponent>;
  let component: ResetPasswordPageComponent;
  let navigate: ReturnType<typeof vi.fn>;
  let resetPassword: ReturnType<typeof vi.fn>;
  let resetTokenValidation: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;

  const createFixture = async (queryParams: Params): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordPageComponent],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap(queryParams)) },
        },
        { provide: Router, useValue: { navigate: navigate } },
        {
          provide: AuthService,
          useValue: { resetPassword: resetPassword, resetTokenValidation: resetTokenValidation },
        },
        { provide: SnackbarService, useValue: { success: success } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  const submitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement;

  const fillPasswords = async (password: string, confirmPassword: string): Promise<void> => {
    component.resetPasswordForm.password().value.set(password);
    component.resetPasswordForm.confirmPassword().value.set(confirmPassword);
    await fixture.whenStable();
  };

  beforeEach(() => {
    navigate = vi.fn().mockResolvedValue(true);
    resetPassword = vi.fn().mockReturnValue(of({}));
    resetTokenValidation = vi.fn().mockReturnValue(of({ valid: true }));
    success = vi.fn();
  });

  describe('with a valid token', () => {
    beforeEach(async () => {
      await createFixture({ [Constants.TOKEN]: 'reset-token' });
    });

    it('validates the token from the query string', () => {
      expect(component.currentResetToken()).toBe('reset-token');
      expect(resetTokenValidation).toHaveBeenCalledWith({ token: 'reset-token' });
      expect(component.isTokenValid()).toBe(true);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('renders the form with both password fields', () => {
      expect(fixture.nativeElement.querySelectorAll('app-input-field')).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('.reset-password__title').textContent).toContain(
        'Reset Your',
      );
    });

    it('keeps the submit button disabled while the form is invalid', () => {
      expect(submitButton().disabled).toBe(true);
    });

    it('keeps the submit button disabled when the passwords do not match', async () => {
      await fillPasswords('Passw0rd!', 'Passw0rd?');

      expect(submitButton().disabled).toBe(true);
    });

    it('enables the submit button for a strong, matching pair', async () => {
      await fillPasswords('Passw0rd!', 'Passw0rd!');

      expect(component.resetPasswordForm().valid()).toBe(true);
      expect(submitButton().disabled).toBe(false);
    });

    it('toggles the password visibility per field index', async () => {
      expect(component.showPassword()).toBe(false);

      component.togglePasswordVisibility(0);
      await fixture.whenStable();
      expect(component.showPassword()).toBe(true);
      expect(component.showConfirmPassword()).toBe(false);

      component.togglePasswordVisibility(1);
      expect(component.showConfirmPassword()).toBe(true);
    });

    it('drives the input type from the visibility toggle', async () => {
      const passwordInput = (): HTMLInputElement =>
        fixture.nativeElement.querySelectorAll('.field-input')[0] as HTMLInputElement;

      expect(passwordInput().type).toBe('password');

      component.togglePasswordVisibility(0);
      await fixture.whenStable();

      expect(passwordInput().type).toBe('text');
    });

    it('sends the new password, confirms it and returns to login', async () => {
      await fillPasswords('Passw0rd!', 'Passw0rd!');

      submitButton().closest('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();

      expect(resetPassword).toHaveBeenCalledWith({
        token: 'reset-token',
        newPassword: 'Passw0rd!',
      });
      expect(success).toHaveBeenCalledWith(Constants.PASSWORD_RESET_SUCCESSFULLY);
      expect(navigate).toHaveBeenCalledWith([Links.LOGIN_URL]);
    });
  });

  describe('with a rejected token', () => {
    it('redirects to the not-found page when the token is missing', async () => {
      await createFixture({});

      expect(component.currentResetToken()).toBeNull();
      expect(resetTokenValidation).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith([Links.NOT_FOUND_URL]);
    });

    it('redirects to the not-found page when the backend rejects the token', async () => {
      resetTokenValidation.mockReturnValue(of({ valid: false }));

      await createFixture({ [Constants.TOKEN]: 'stale-token' });

      expect(component.isTokenValid()).toBe(false);
      expect(navigate).toHaveBeenCalledWith([Links.NOT_FOUND_URL]);
    });

    it('redirects to the not-found page when the validation request fails', async () => {
      resetTokenValidation.mockReturnValue(throwError(() => new Error('500')));

      await createFixture({ [Constants.TOKEN]: 'stale-token' });

      expect(component.isTokenValid()).toBe(false);
      expect(navigate).toHaveBeenCalledWith([Links.NOT_FOUND_URL]);
    });
  });
});
