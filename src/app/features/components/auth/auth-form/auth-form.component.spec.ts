import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { submit } from '@angular/forms/signals';
import { AuthFormComponent } from './auth-form.component';
import { AuthService } from '../../../services/auth-service/auth.service';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { TwoFactorModalComponent } from '../../../dialogs/two-factor-modal/two-factor-modal.component';
import { ForgetPasswordModalComponent } from '../../../dialogs/forget-password-modal/forget-password-modal.component';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';
import { AUTH_TYPE } from '../../../enums/auth-type.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { IModalOptions } from '../../../../shared/models/modal.model';
import type { IRegisterForm } from '../../../models/auth-form.model';

describe('AuthFormComponent', () => {
  let fixture: ComponentFixture<AuthFormComponent>;
  let component: AuthFormComponent;
  let login: ReturnType<typeof vi.fn>;
  let register: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let open: ReturnType<typeof vi.fn>;

  const createFixture = async (authType: string = AUTH_TYPE.LOGIN): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [AuthFormComponent],
      providers: [
        { provide: AuthService, useValue: { login: login, register: register } },
        { provide: Router, useValue: { navigate: navigate } },
        { provide: ModalService, useValue: { open: open } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('authType', authType);
    await fixture.whenStable();
  };

  const fillLogin = (email: string = 'ada@example.com', password: string = 'Passw0rd!'): void => {
    component.loginForm.email().value.set(email);
    component.loginForm.password().value.set(password);
  };

  const fillRegister = (overrides: Partial<IRegisterForm> = {}): void => {
    const model: IRegisterForm = {
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@example.com',
      recoveryEmail: '',
      dateOfBirth: new Date(1994, 2, 7),
      password: 'Passw0rd!',
      confirmPassword: 'Passw0rd!',
      addInformation: false,
      typeOfArtist: 'Artist',
      artistOrBandName: '',
      description: '',
      ...overrides,
    };

    (Object.keys(model) as (keyof IRegisterForm)[]).forEach(key => {
      component.registerForm[key]().value.set(model[key] as never);
    });
  };

  beforeEach(() => {
    login = vi.fn().mockReturnValue(of({ challengeId: 'challenge', requiresTwoFactor: true, token: null }));
    register = vi.fn().mockReturnValue(of({ challengeId: null, requiresTwoFactor: false, token: 'jwt' }));
    navigate = vi.fn().mockResolvedValue(true);
    open = vi.fn().mockReturnValue({ closed: of('123456') });
  });

  describe('login mode', () => {
    beforeEach(async () => {
      await createFixture(AUTH_TYPE.LOGIN);
    });

    it('renders the login form', () => {
      expect(fixture.nativeElement.querySelector('.form-content__title').textContent).toBe('Log In');
      expect(fixture.nativeElement.querySelectorAll('app-input-field')).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('app-date-field')).toBeNull();
    });

    it('starts with both passwords hidden', () => {
      expect(component.showPassword()).toBe(false);
      expect(component.showConfirmPassword()).toBe(false);
    });

    it('toggles the password visibility per field index', () => {
      component.togglePasswordVisibility(0);
      expect(component.showPassword()).toBe(true);
      expect(component.showConfirmPassword()).toBe(false);

      component.togglePasswordVisibility(1);
      expect(component.showConfirmPassword()).toBe(true);
    });

    it('navigates to the register page when switching', () => {
      component.onSwitchAuthType();

      expect(navigate).toHaveBeenCalledWith([Links.REGISTER_URL]);
    });

    it('opens the forget-password modal', () => {
      component.onForgetPassword();

      expect(open.mock.calls[0]?.[0]).toBe(ForgetPasswordModalComponent);
      expect((open.mock.calls[0]?.[1] as IModalOptions).hasHeader).toBe(false);
    });

    it('verifies through the two-factor modal and lands on the uploads page', async () => {
      fillLogin();

      await submit(component.loginForm);

      expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'Passw0rd!' });
      expect(open.mock.calls[0]?.[0]).toBe(TwoFactorModalComponent);
      expect((open.mock.calls[0]?.[1] as IModalOptions<{ challengeId: string | null }>).data).toEqual({
        email: 'ada@example.com',
        challengeId: 'challenge',
      });
      expect(navigate).toHaveBeenCalledWith([Links.UPLOADS_URL]);
      expect(component.loginError()).toBeUndefined();
    });

    it('surfaces a server error and stays on the page when login fails', async () => {
      login.mockReturnValue(throwError(() => new Error('401')));
      fillLogin();

      await submit(component.loginForm);
      await fixture.whenStable();

      expect(component.loginError()).toBe(Constants.INVALID_LOGIN_PASSWORD);
      expect(navigate).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('.form-content__error').textContent).toBe(
        Constants.INVALID_LOGIN_PASSWORD,
      );
    });

    it('does not call the api for an invalid form', async () => {
      await submit(component.loginForm);

      expect(login).not.toHaveBeenCalled();
    });
  });

  describe('register mode', () => {
    beforeEach(async () => {
      await createFixture(AUTH_TYPE.REGISTER);
    });

    it('renders the register form', () => {
      expect(fixture.nativeElement.querySelector('.form-content__title').textContent).toBe(
        'Create Your Account',
      );
      expect(fixture.nativeElement.querySelector('app-date-field')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-checkbox-field')).not.toBeNull();
    });

    it('hides the artist fields until the extra information is requested', async () => {
      expect(fixture.nativeElement.querySelector('app-radio-field')).toBeNull();

      component.registerForm.addInformation().value.set(true);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('app-radio-field')).not.toBeNull();
    });

    it('navigates to the login page when switching', () => {
      component.onSwitchAuthType();

      expect(navigate).toHaveBeenCalledWith([Links.LOGIN_URL]);
    });

    it('sends the mapped payload and lands on the uploads page', async () => {
      fillRegister();

      await submit(component.registerForm);

      expect(register).toHaveBeenCalledWith({
        name: 'Ada',
        surname: 'Lovelace',
        email: 'ada@example.com',
        recoveryEmail: null,
        dateOfBirth: new Date(1994, 2, 7),
        password: 'Passw0rd!',
        artistInformation: {
          typeOfArtist: 'ARTIST',
          artistName: null,
          description: null,
        },
      });
      expect(navigate).toHaveBeenCalledWith([Links.UPLOADS_URL]);
    });

    it('forwards the optional artist details when they are filled in', async () => {
      fillRegister({
        recoveryEmail: 'backup@example.com',
        addInformation: true,
        typeOfArtist: 'Band',
        artistOrBandName: 'The Band',
        description: 'Indie rock',
      });

      await submit(component.registerForm);

      expect(register.mock.calls[0]?.[0]).toMatchObject({
        recoveryEmail: 'backup@example.com',
        artistInformation: {
          typeOfArtist: 'BAND',
          artistName: 'The Band',
          description: 'Indie rock',
        },
      });
    });

    it('surfaces a server error when registration fails', async () => {
      register.mockReturnValue(throwError(() => new Error('500')));
      fillRegister();

      await submit(component.registerForm);
      await fixture.whenStable();

      expect(component.registerError()).toBe(Constants.REGISTRATION_FAILED);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does not call the api for an invalid form', async () => {
      await submit(component.registerForm);

      expect(register).not.toHaveBeenCalled();
    });
  });
});
