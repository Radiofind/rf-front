import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import { ForgetPasswordModalComponent } from './forget-password-modal.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';

import type { ComponentFixture } from '@angular/core/testing';

describe('ForgetPasswordModalComponent', () => {
  let fixture: ComponentFixture<ForgetPasswordModalComponent>;
  let component: ForgetPasswordModalComponent;
  let close: ReturnType<typeof vi.fn>;
  let forgetPassword: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;

  const submitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement;

  beforeEach(async () => {
    close = vi.fn();
    forgetPassword = vi.fn().mockReturnValue(of({}));
    success = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ForgetPasswordModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        { provide: AuthService, useValue: { forgetPassword: forgetPassword } },
        { provide: SnackbarService, useValue: { success: success } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgetPasswordModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the email field and the explanation', () => {
    expect(fixture.nativeElement.querySelector('.forgot-password__title').textContent).toBe(
      'Forgot Your Password?',
    );
    expect(fixture.nativeElement.querySelector('app-input-field')).not.toBeNull();
  });

  it('keeps the submit button disabled while the email is missing', () => {
    expect(component.forgetPasswordForm().invalid()).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  it('keeps the submit button disabled for a malformed email', async () => {
    component.forgetPasswordForm.email().value.set('nope');
    await fixture.whenStable();

    expect(submitButton().disabled).toBe(true);
  });

  it('enables the submit button for a valid email', async () => {
    component.forgetPasswordForm.email().value.set('ada@example.com');
    await fixture.whenStable();

    expect(component.forgetPasswordForm().valid()).toBe(true);
    expect(submitButton().disabled).toBe(false);
  });

  it('closes the modal, sends the request and confirms with a snackbar', async () => {
    component.forgetPasswordForm.email().value.set('ada@example.com');
    await fixture.whenStable();

    await component.sendResetLink();

    expect(close).toHaveBeenCalledTimes(1);
    expect(forgetPassword).toHaveBeenCalledWith({ email: 'ada@example.com' });
    expect(success).toHaveBeenCalledWith('Email sent successfully');
  });
});
