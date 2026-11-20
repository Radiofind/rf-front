import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';
import { SupportContactService } from './support-contact.service';
import { SupportService } from '../support-service/support.service';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { userFeature } from '../../../store/user/user.feature';
import { SupportMessageModalComponent } from '../../dialogs/support-message-modal/support-message-modal.component';

describe('SupportContactService', () => {
  const written = { subject: 'Upload stuck', message: 'My track stays in review' };

  const configure = (
    open: ReturnType<typeof vi.fn>,
    sendMessage: ReturnType<typeof vi.fn> = vi.fn(),
    snackbar: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> } = {
      success: vi.fn(),
      error: vi.fn(),
    },
  ): SupportContactService => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [{ selector: userFeature.selectEmail, value: 'ada@example.com' }],
        }),
        { provide: ModalService, useValue: { open: open } },
        { provide: SupportService, useValue: { sendMessage: sendMessage } },
        { provide: SnackbarService, useValue: snackbar },
      ],
    });

    return TestBed.inject(SupportContactService);
  };

  it('opens an empty form addressed to the account email', () => {
    const open = vi.fn().mockReturnValue({ closed: of(undefined) });

    configure(open).openMessageForm();

    expect(open).toHaveBeenCalledExactlyOnceWith(
      SupportMessageModalComponent,
      expect.objectContaining({ data: { email: 'ada@example.com', draft: null } }),
    );
  });

  it('sends the submitted message and confirms it', () => {
    const sendMessage = vi.fn().mockReturnValue(of(undefined));
    const snackbar = { success: vi.fn(), error: vi.fn() };

    configure(
      vi.fn().mockReturnValue({ closed: of(written) }),
      sendMessage,
      snackbar,
    ).openMessageForm();

    expect(sendMessage).toHaveBeenCalledExactlyOnceWith(written);
    expect(snackbar.success).toHaveBeenCalledExactlyOnceWith('messages.supportMessageSent');
  });

  it('keeps a message that failed to send for the next form', () => {
    const open = vi
      .fn()
      .mockReturnValueOnce({ closed: of(written) })
      .mockReturnValueOnce({ closed: of(undefined) });
    const sendMessage = vi
      .fn()
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    const snackbar = { success: vi.fn(), error: vi.fn() };
    const service: SupportContactService = configure(open, sendMessage, snackbar);

    service.openMessageForm();
    service.openMessageForm();

    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith('messages.supportMessageFailed');
    expect(open).toHaveBeenLastCalledWith(
      SupportMessageModalComponent,
      expect.objectContaining({ data: { email: 'ada@example.com', draft: written } }),
    );
  });

  it('asks to wait after too many messages', () => {
    const sendMessage = vi
      .fn()
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429 })));
    const snackbar = { success: vi.fn(), error: vi.fn() };

    configure(
      vi.fn().mockReturnValue({ closed: of(written) }),
      sendMessage,
      snackbar,
    ).openMessageForm();

    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith('messages.supportMessageTooMany');
  });

  it('sends nothing when the form is dismissed', () => {
    const sendMessage = vi.fn();

    configure(vi.fn().mockReturnValue({ closed: of(undefined) }), sendMessage).openMessageForm();

    expect(sendMessage).not.toHaveBeenCalled();
  });
});
