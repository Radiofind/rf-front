import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TwoFactorMethodModalComponent } from './two-factor-method-modal.component';
import { UserService } from '../../services/user-service/user.service';
import { Constants } from '../../../core/constants/constants';
import { TwoFactorMethodEnum } from '../../../core/enums/two-factor-method.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { ISecurityOverview } from '../../../core/models/settings.model';

describe('TwoFactorMethodModalComponent', () => {
  let close: ReturnType<typeof vi.fn>;
  let startTwoFactorEnrollment: ReturnType<typeof vi.fn>;
  let confirmTwoFactorEnrollment: ReturnType<typeof vi.fn>;
  let security: ISecurityOverview;

  const createFixture = async (): Promise<ComponentFixture<TwoFactorMethodModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorMethodModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        { provide: DIALOG_DATA, useValue: { security: security } },
        {
          provide: UserService,
          useValue: {
            startTwoFactorEnrollment: startTwoFactorEnrollment,
            confirmTwoFactorEnrollment: confirmTwoFactorEnrollment,
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = TestBed.createComponent(
      TwoFactorMethodModalComponent,
    );
    await fixture.whenStable();

    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    close = vi.fn();
    security = {
      twoFactorMethod: TwoFactorMethodEnum.EMAIL,
      email: 'ad***@example.com',
      recoveryEmail: null,
      backupCodesRemaining: 0,
    };
    startTwoFactorEnrollment = vi.fn().mockReturnValue(
      of({
        method: TwoFactorMethodEnum.AUTHENTICATOR,
        destination: null,
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUri: 'otpauth://totp/RADIOFIND:ada?secret=JBSWY3DPEHPK3PXP&issuer=RADIOFIND',
      }),
    );
    confirmTwoFactorEnrollment = vi
      .fn()
      .mockReturnValue(of({ ...security, twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR }));
  });

  it('cannot continue with the method already in use', async () => {
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();
    fixture.componentInstance.onPasswordChange('secret');

    expect(fixture.componentInstance.canStart()).toBe(false);
  });

  it('offers no recovery email when the profile has none', async () => {
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();

    const recovery: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[value="RECOVERY_EMAIL"]',
    );

    expect(recovery.disabled).toBe(true);
  });

  it('shows the QR code and key once the authenticator setup starts', async () => {
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();
    fixture.componentInstance.onMethodChange(TwoFactorMethodEnum.AUTHENTICATOR);
    fixture.componentInstance.onPasswordChange('secret');

    await fixture.componentInstance.onStart();
    await fixture.whenStable();

    expect(startTwoFactorEnrollment).toHaveBeenCalledWith(
      TwoFactorMethodEnum.AUTHENTICATOR,
      'secret',
    );
    expect(fixture.nativeElement.querySelector('.method-modal__qr').src).toMatch(
      /^data:image\/png;base64,/,
    );
    expect(fixture.nativeElement.querySelector('.method-modal__secret').textContent).toBe(
      'JBSWY3DPEHPK3PXP',
    );
  });

  it('names a wrong password and stays on the first step', async () => {
    startTwoFactorEnrollment.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_FORBIDDEN_STATUS })),
    );
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();
    fixture.componentInstance.onMethodChange(TwoFactorMethodEnum.AUTHENTICATOR);
    fixture.componentInstance.onPasswordChange('wrong');

    await fixture.componentInstance.onStart();

    expect(fixture.componentInstance.enrollment()).toBeNull();
    expect(fixture.componentInstance.errors()[0]?.message).toBe(
      'accountSettings.errors.incorrectPassword',
    );
  });

  it('closes with the new security state once the code is confirmed', async () => {
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();
    fixture.componentInstance.onMethodChange(TwoFactorMethodEnum.AUTHENTICATOR);
    fixture.componentInstance.onPasswordChange('secret');
    await fixture.componentInstance.onStart();
    fixture.componentInstance.onCodeChange('123456');

    await fixture.componentInstance.onConfirm();

    expect(confirmTwoFactorEnrollment).toHaveBeenCalledWith('123456');
    expect(close).toHaveBeenCalledWith({
      ...security,
      twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR,
    });
  });

  it('keeps the dialog open on a wrong code', async () => {
    confirmTwoFactorEnrollment.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: Constants.HTTP_UNPROCESSABLE_CONTENT_STATUS }),
      ),
    );
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();
    fixture.componentInstance.onMethodChange(TwoFactorMethodEnum.AUTHENTICATOR);
    fixture.componentInstance.onPasswordChange('secret');
    await fixture.componentInstance.onStart();
    fixture.componentInstance.onCodeChange('000000');

    await fixture.componentInstance.onConfirm();

    expect(close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.errors()[0]?.message).toBe(
      'accountSettings.errors.invalidCode',
    );
  });

  it('starts over when the setup has expired', async () => {
    confirmTwoFactorEnrollment.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_GONE_STATUS })),
    );
    const fixture: ComponentFixture<TwoFactorMethodModalComponent> = await createFixture();
    fixture.componentInstance.onMethodChange(TwoFactorMethodEnum.AUTHENTICATOR);
    fixture.componentInstance.onPasswordChange('secret');
    await fixture.componentInstance.onStart();
    fixture.componentInstance.onCodeChange('123456');

    await fixture.componentInstance.onConfirm();

    expect(fixture.componentInstance.enrollment()).toBeNull();
    expect(fixture.componentInstance.errors()[0]?.message).toBe(
      'accountSettings.errors.setupExpired',
    );
  });
});
