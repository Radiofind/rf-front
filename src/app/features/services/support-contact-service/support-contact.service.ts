import { DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, filter, switchMap, tap } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { userFeature } from '../../../store/user/user.feature';
import { SupportMessageModalComponent } from '../../dialogs/support-message-modal/support-message-modal.component';
import { SupportService } from '../support-service/support.service';
import { SUPPORT_MESSAGES } from '../../constants/support.constant';

import type { WritableSignal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { ISupportMessageDialogData, ISupportMessageForm } from '../../models/support.model';

@Service()
export class SupportContactService {
  private readonly store: Store = inject(Store);

  private readonly modalService: ModalService = inject(ModalService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  private readonly supportService: SupportService = inject(SupportService);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly draft: WritableSignal<ISupportMessageForm | null> =
    signal<ISupportMessageForm | null>(null);

  public openMessageForm(): void {
    this.modalService
      .open<ISupportMessageForm, ISupportMessageDialogData, SupportMessageModalComponent>(
        SupportMessageModalComponent,
        {
          title: 'support.message.title',
          iconClass: 'bx bx-envelope',
          data: {
            email: this.store.selectSignal(userFeature.selectEmail)(),
            draft: this.draft(),
          },
        },
      )
      .closed.pipe(
        filter((message: ISupportMessageForm | undefined) => !!message),
        switchMap((message: ISupportMessageForm) => this.send(message)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private send(message: ISupportMessageForm): Observable<void> {
    return this.supportService.sendMessage(message).pipe(
      tap(() => {
        this.draft.set(null);
        this.snackbarService.success(SUPPORT_MESSAGES.sent);
      }),
      catchError((error: unknown) => {
        this.draft.set(message);
        this.snackbarService.error(this.sendErrorMessage(error));

        return EMPTY;
      }),
    );
  }

  private sendErrorMessage(error: unknown): TranslationKey {
    return error instanceof HttpErrorResponse &&
      error.status === Constants.HTTP_TOO_MANY_REQUESTS_STATUS
      ? SUPPORT_MESSAGES.tooMany
      : SUPPORT_MESSAGES.failed;
  }
}
