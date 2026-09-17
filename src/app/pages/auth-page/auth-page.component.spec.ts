import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DeferBlockBehavior } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthPageComponent } from './auth-page.component';
import { AuthService } from '../../features/services/auth-service/auth.service';
import { ModalService } from '../../shared/services/modal-service/modal.service';
import {
  AUTH_DESCRIPTION_CONTENT_LOGIN,
  AUTH_DESCRIPTION_CONTENT_REGISTER,
} from '../../features/constants/auth-content.constant';
import { Constants } from '../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';
import type { Data } from '@angular/router';

describe('AuthPageComponent', () => {
  const createFixture = async (data: Data): Promise<ComponentFixture<AuthPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [AuthPageComponent],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
      providers: [
        { provide: ActivatedRoute, useValue: { data: of(data) } },
        { provide: Router, useValue: { navigate: (): Promise<boolean> => Promise.resolve(true) } },
        { provide: AuthService, useValue: {} },
        { provide: ModalService, useValue: { open: (): unknown => ({ closed: of(undefined) }) } },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<AuthPageComponent> = TestBed.createComponent(AuthPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  it('reads the auth type from the route data', async () => {
    const fixture: ComponentFixture<AuthPageComponent> = await createFixture({
      [Constants.AUTH_TYPE_PROP]: Constants.REGISTER,
    });

    expect(fixture.componentInstance.authType()).toBe(Constants.REGISTER);
  });

  it('renders the login layout with the login description', async () => {
    const fixture: ComponentFixture<AuthPageComponent> = await createFixture({
      [Constants.AUTH_TYPE_PROP]: Constants.LOGIN,
    });

    expect(fixture.nativeElement.querySelector('.login-bg')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.register-bg')).toBeNull();
    expect(fixture.nativeElement.querySelector('.description-instructions').textContent).toBe(
      AUTH_DESCRIPTION_CONTENT_LOGIN.instructions,
    );
    expect(fixture.nativeElement.querySelector('.auth-form.register-width')).toBeNull();
  });

  it('renders the register layout with the register description', async () => {
    const fixture: ComponentFixture<AuthPageComponent> = await createFixture({
      [Constants.AUTH_TYPE_PROP]: Constants.REGISTER,
    });

    expect(fixture.nativeElement.querySelector('.register-bg')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.login-bg')).toBeNull();
    expect(fixture.nativeElement.querySelector('.description-instructions').textContent).toBe(
      AUTH_DESCRIPTION_CONTENT_REGISTER.instructions,
    );
    expect(fixture.nativeElement.querySelector('.auth-form.register-width')).not.toBeNull();
  });

  it('forwards the auth type to the form', async () => {
    const fixture: ComponentFixture<AuthPageComponent> = await createFixture({
      [Constants.AUTH_TYPE_PROP]: Constants.REGISTER,
    });

    expect(fixture.nativeElement.querySelector('.form-content__title').textContent).toBe(
      'Create Your Account',
    );
  });

  it('renders the header and the copyright line', async () => {
    const fixture: ComponentFixture<AuthPageComponent> = await createFixture({
      [Constants.AUTH_TYPE_PROP]: Constants.LOGIN,
    });

    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.rights').textContent).toContain('RADIOFIND');
  });
});
