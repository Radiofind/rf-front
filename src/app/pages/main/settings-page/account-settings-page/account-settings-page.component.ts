import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { filter, map, tap } from 'rxjs';
import { ModalSizeEnum } from '../../../../core/enums/modal-size.enum';
import { SettingsRowComponent } from '../../../../features/components/settings/settings-row/settings-row.component';
import { BackupCodesModalComponent } from '../../../../features/dialogs/backup-codes-modal/backup-codes-modal.component';
import { TwoFactorMethodModalComponent } from '../../../../features/dialogs/two-factor-method-modal/two-factor-method-modal.component';
import { PasswordConfirmModalComponent } from '../../../../features/dialogs/password-confirm-modal/password-confirm-modal.component';
import { TWO_FACTOR_METHOD_LABELS } from '../../../../features/constants/settings.constant';
import { UserService } from '../../../../features/services/user-service/user.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch.component';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { accountSettingsFeature } from '../../../../store/account-settings/account-settings.feature';
import { AccountSettingsPageActions } from '../../../../store/ui/account-settings-page.actions';

import type { OnInit, Signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  IBackupCodes,
  INotificationSettings,
  ISecurityOverview,
} from '../../../../core/models/settings.model';
import type { TranslationKey } from '../../../../core/types/translation.type';
import type {
  IBackupCodesModalData,
  IPasswordConfirmModalData,
  ITwoFactorMethodModalData,
} from '../../../../features/models/account-settings-dialog.model';

@Component({
  selector: 'app-account-settings-page',
  templateUrl: './account-settings-page.component.html',
  styleUrl: './account-settings-page.component.scss',
  imports: [SettingsRowComponent, ToggleSwitchComponent, ButtonComponent, TranslatePipe],
})
export class AccountSettingsPageComponent implements OnInit {
  private readonly store: Store = inject(Store);

  private readonly modalService: ModalService = inject(ModalService);

  private readonly userService: UserService = inject(UserService);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly notifications: Signal<INotificationSettings> = this.store.selectSignal(
    accountSettingsFeature.selectNotifications,
  );

  protected readonly security: Signal<ISecurityOverview | null> = this.store.selectSignal(
    accountSettingsFeature.selectSecurity,
  );

  private readonly isLoaded: Signal<boolean> = this.store.selectSignal(
    accountSettingsFeature.selectIsLoaded,
  );

  protected readonly isDisabled: Signal<boolean> = computed<boolean>(() => !this.isLoaded());

  protected readonly twoFactorMethodLabel: Signal<TranslationKey | null> = computed(() => {
    const security: ISecurityOverview | null = this.security();
    return security ? TWO_FACTOR_METHOD_LABELS[security.twoFactorMethod] : null;
  });

  protected readonly backupCodesRemaining: Signal<number> = computed<number>(
    () => this.security()?.backupCodesRemaining ?? 0,
  );

  public ngOnInit(): void {
    this.store.dispatch(AccountSettingsPageActions.opened());
  }

  public onNotificationChange<K extends keyof INotificationSettings>(
    key: K,
    value: INotificationSettings[K],
  ): void {
    if (this.notifications()[key] === value) {
      return;
    }

    this.store.dispatch(
      AccountSettingsPageActions.notificationSettingChanged({ changes: { [key]: value } }),
    );
  }

  public onManageTwoFactor(): void {
    const security: ISecurityOverview | null = this.security();

    if (!security) {
      return;
    }

    this.modalService
      .open<ISecurityOverview, ITwoFactorMethodModalData, TwoFactorMethodModalComponent>(
        TwoFactorMethodModalComponent,
        {
          title: 'accountSettings.twoFactorTitle',
          iconClass: 'bx bx-check-shield',
          size: ModalSizeEnum.MEDIUM,
          data: { security: security },
        },
      )
      .closed.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe((changed: ISecurityOverview) => {
        this.store.dispatch(AccountSettingsPageActions.securityChanged({ security: changed }));
      });
  }

  public onGenerateBackupCodes(): void {
    this.confirmWithPassword<IBackupCodes>('accountSettings.backupCodesTitle', 'bx bx-key', {
      message: 'accountSettings.generateBackupCodesMessage',
      description: 'accountSettings.generateBackupCodesDescription',
      confirmText: 'accountSettings.generate',
      submit: (password: string) => this.userService.regenerateBackupCodes(password),
    })
      .pipe(
        tap(({ codes }: IBackupCodes) => {
          const security: ISecurityOverview | null = this.security();

          if (security) {
            this.store.dispatch(
              AccountSettingsPageActions.securityChanged({
                security: { ...security, backupCodesRemaining: codes.length },
              }),
            );
          }
        }),
      )
      .subscribe(({ codes }: IBackupCodes) => {
        this.modalService.open<boolean, IBackupCodesModalData, BackupCodesModalComponent>(
          BackupCodesModalComponent,
          {
            title: 'accountSettings.backupCodesTitle',
            iconClass: 'bx bx-key',
            size: ModalSizeEnum.MEDIUM,
            disableClose: true,
            hasCloseButton: false,
            data: { codes: codes },
          },
        );
      });
  }

  public onDeleteAccount(): void {
    this.confirmWithPassword<boolean>('accountSettings.deleteAccountTitle', 'bx bx-trash', {
      message: 'accountSettings.deleteAccountMessage',
      description: 'accountSettings.deleteAccountWarning',
      confirmText: 'accountSettings.deleteAccount',
      isDanger: true,
      submit: (password: string) => this.userService.deleteAccount(password).pipe(map(() => true)),
    }).subscribe(() => {
      this.store.dispatch(AccountSettingsPageActions.accountDeleted());
    });
  }

  private confirmWithPassword<R>(
    title: TranslationKey,
    iconClass: string,
    data: IPasswordConfirmModalData<R>,
  ): Observable<R> {
    return this.modalService
      .open<
        R,
        IPasswordConfirmModalData<R>,
        PasswordConfirmModalComponent<R>
      >(PasswordConfirmModalComponent<R>, { title: title, iconClass: iconClass, size: ModalSizeEnum.SMALL, data: data })
      .closed.pipe(
        filter((result: R | undefined): result is R => result !== undefined),
        takeUntilDestroyed(this.destroyRef),
      );
  }
}
