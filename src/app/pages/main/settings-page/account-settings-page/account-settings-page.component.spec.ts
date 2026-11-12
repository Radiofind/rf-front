import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AccountSettingsPageComponent } from './account-settings-page.component';
import { accountSettingsFeature } from '../../../../store/account-settings/account-settings.feature';
import { AccountSettingsPageActions } from '../../../../store/ui/account-settings-page.actions';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { UserService } from '../../../../features/services/user-service/user.service';
import { TwoFactorMethodModalComponent } from '../../../../features/dialogs/two-factor-method-modal/two-factor-method-modal.component';
import { BackupCodesModalComponent } from '../../../../features/dialogs/backup-codes-modal/backup-codes-modal.component';
import { TwoFactorMethodEnum } from '../../../../core/enums/two-factor-method.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type {
  INotificationSettings,
  ISecurityOverview,
} from '../../../../core/models/settings.model';
import type { IModalOptions } from '../../../../shared/models/modal.model';

describe('AccountSettingsPageComponent', () => {
  const storedNotifications: INotificationSettings = {
    trackUpdates: true,
    radioUpdates: false,
    likes: true,
  };

  let security: ISecurityOverview;
  let closed: Subject<unknown>;
  let open: ReturnType<typeof vi.fn>;
  let dispatch: ReturnType<typeof vi.spyOn>;

  const createFixture = async (): Promise<ComponentFixture<AccountSettingsPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsPageComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: accountSettingsFeature.selectNotifications, value: storedNotifications },
            { selector: accountSettingsFeature.selectSecurity, value: security },
            { selector: accountSettingsFeature.selectIsLoaded, value: true },
          ],
        }),
        { provide: ModalService, useValue: { open: open } },
        { provide: UserService, useValue: {} },
      ],
    }).compileComponents();

    dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    const fixture: ComponentFixture<AccountSettingsPageComponent> = TestBed.createComponent(
      AccountSettingsPageComponent,
    );
    await fixture.whenStable();

    return fixture;
  };

  const row = (fixture: ComponentFixture<AccountSettingsPageComponent>, id: string): HTMLElement =>
    (fixture.nativeElement as HTMLElement)
      .querySelector(`#${id}-title`)!
      .closest('app-settings-row')!;

  const button = (
    fixture: ComponentFixture<AccountSettingsPageComponent>,
    id: string,
  ): HTMLButtonElement => row(fixture, id).querySelector('button')!;

  beforeEach(() => {
    TestBed.resetTestingModule();
    security = {
      twoFactorMethod: TwoFactorMethodEnum.EMAIL,
      email: 'ad***@example.com',
      recoveryEmail: null,
      backupCodesRemaining: 0,
    };
    closed = new Subject<unknown>();
    open = vi.fn().mockReturnValue({ closed: closed });
  });

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
  });

  it('asks for the account settings when it opens', async () => {
    await createFixture();

    expect(dispatch).toHaveBeenCalledWith(AccountSettingsPageActions.opened());
  });

  it('renders the security, notification and danger zone sections', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();

    const titles: string[] = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('h2'),
    ).map((title) => title.textContent.trim());

    expect(titles).toEqual(['Security', 'Notifications', 'Danger Zone']);
  });

  it('shows the current two-factor method', async () => {
    security = { ...security, twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR };
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();

    expect(
      row(fixture, 'settings-two-factor').querySelector('.row__description')!.textContent,
    ).toBe('Current method: Authenticator app');
  });

  it('saves a switched notification category', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();

    row(fixture, 'settings-radio-updates')
      .querySelector<HTMLInputElement>('input[role="switch"]')!
      .click();
    await fixture.whenStable();

    expect(dispatch).toHaveBeenLastCalledWith(
      AccountSettingsPageActions.notificationSettingChanged({ changes: { radioUpdates: true } }),
    );
  });

  it('opens the method dialog with the current security state', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();

    button(fixture, 'settings-two-factor').click();

    expect(open.mock.calls[0]?.[0]).toBe(TwoFactorMethodModalComponent);
    expect((open.mock.calls[0]?.[1] as IModalOptions).data).toEqual({ security: security });
  });

  it('keeps the security state the method dialog returns', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();
    button(fixture, 'settings-two-factor').click();

    closed.next({ ...security, twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR });

    expect(dispatch).toHaveBeenLastCalledWith(
      AccountSettingsPageActions.securityChanged({
        security: { ...security, twoFactorMethod: TwoFactorMethodEnum.AUTHENTICATOR },
      }),
    );
  });

  it('changes nothing when the method dialog is dismissed', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();
    button(fixture, 'settings-two-factor').click();
    dispatch.mockClear();

    closed.next(undefined);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows the generated backup codes once', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();
    button(fixture, 'settings-backup-codes').click();

    closed.next({ codes: ['ABCDE-FGHJK', 'KMNPQ-RSTVW'] });

    expect(open.mock.calls[1]?.[0]).toBe(BackupCodesModalComponent);
    expect((open.mock.calls[1]?.[1] as IModalOptions).data).toEqual({
      codes: ['ABCDE-FGHJK', 'KMNPQ-RSTVW'],
    });
  });

  it('signs out once the account is deleted', async () => {
    const fixture: ComponentFixture<AccountSettingsPageComponent> = await createFixture();
    button(fixture, 'settings-delete-account').click();

    closed.next(true);

    expect(dispatch).toHaveBeenLastCalledWith(AccountSettingsPageActions.accountDeleted());
  });
});
