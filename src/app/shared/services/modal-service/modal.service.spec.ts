import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import { ModalService } from './modal.service';
import { ConfirmModalComponent } from '../../components/modal/confirm-modal/confirm-modal.component';
import { ModalContainerComponent } from '../../components/modal/modal-container/modal-container.component';
import { Constants } from '../../../core/constants/constants';
import { ModalSizeEnum } from '../../../core/enums/modal-size.enum';

import type { Observable } from 'rxjs';
import type { IConfirmModalData, IModalDialogConfig } from '../../models/modal.model';

describe('ModalService', () => {
  const confirmData: IConfirmModalData = { message: 'Delete this track?' };

  let service: ModalService;
  let open: ReturnType<typeof vi.fn>;
  let closeAll: ReturnType<typeof vi.fn>;
  let closed: Observable<boolean | undefined>;

  const openedConfig = (): IModalDialogConfig => open.mock.calls[0]?.[1] as IModalDialogConfig;

  beforeEach(() => {
    closed = of(undefined);
    open = vi.fn().mockImplementation(() => ({ closed: closed }));
    closeAll = vi.fn();

    TestBed.configureTestingModule({
      providers: [ModalService, { provide: Dialog, useValue: { open: open, closeAll: closeAll } }],
    });

    service = TestBed.inject(ModalService);
  });

  it('opens the component inside the custom modal container', () => {
    service.open(ConfirmModalComponent);

    expect(open.mock.calls[0]?.[0]).toBe(ConfirmModalComponent);
    expect(openedConfig().container).toBe(ModalContainerComponent);
  });

  it('applies the medium size by default', () => {
    service.open(ConfirmModalComponent);

    expect(openedConfig().size).toBe(ModalSizeEnum.MEDIUM);
    expect(openedConfig().width).toBe(Constants.MODAL_SIZE_MEDIUM);
  });

  it.each([
    [ModalSizeEnum.SMALL, Constants.MODAL_SIZE_SMALL],
    [ModalSizeEnum.MEDIUM, Constants.MODAL_SIZE_MEDIUM],
    [ModalSizeEnum.LARGE, Constants.MODAL_SIZE_LARGE],
  ])('maps the %s size to its width', (size, expectedWidth) => {
    service.open(ConfirmModalComponent, { size: size });

    expect(openedConfig().width).toBe(expectedWidth);
  });

  it('fills in the shared accessibility and backdrop defaults', () => {
    service.open(ConfirmModalComponent);

    const config: IModalDialogConfig = openedConfig();

    expect(config.maxWidth).toBe(Constants.MODAL_MAX_WIDTH);
    expect(config.maxHeight).toBe(Constants.MODAL_MAX_HEIGHT);
    expect(config.panelClass).toBe(Constants.MODAL_PANEL_CLASS);
    expect(config.backdropClass).toBe(Constants.MODAL_BACKDROP_CLASS);
    expect(config.hasBackdrop).toBe(true);
    expect(config.ariaModal).toBe(true);
    expect(config.restoreFocus).toBe(true);
    expect(config.autoFocus).toBe(Constants.MODAL_AUTO_FOCUS_TARGET);
    expect(config.hasHeader).toBe(true);
    expect(config.hasCloseButton).toBe(true);
    expect(config.disableClose).toBe(false);
  });

  it('lets the caller override the defaults', () => {
    service.open(ConfirmModalComponent, {
      panelClass: 'custom-panel',
      hasHeader: false,
      hasCloseButton: false,
      disableClose: true,
      ariaLabel: 'Two-Factor Authentication',
    });

    const config: IModalDialogConfig = openedConfig();

    expect(config.panelClass).toBe('custom-panel');
    expect(config.hasHeader).toBe(false);
    expect(config.hasCloseButton).toBe(false);
    expect(config.disableClose).toBe(true);
    expect(config.ariaLabel).toBe('Two-Factor Authentication');
  });

  it('opens confirm dialogs as a small modal carrying the data', () => {
    service.confirm(confirmData).subscribe();

    expect(open.mock.calls[0]?.[0]).toBe(ConfirmModalComponent);
    expect(openedConfig().size).toBe(ModalSizeEnum.SMALL);
    expect(openedConfig().data).toBe(confirmData);
  });

  it('resolves confirm() to the dialog result', () => {
    closed = of(true);
    let result: boolean | undefined;

    service.confirm(confirmData).subscribe((value) => {
      result = value;
    });

    expect(result).toBe(true);
  });

  it('resolves confirm() to false when the modal is dismissed', () => {
    closed = of(undefined);
    let result: boolean | undefined;

    service.confirm(confirmData).subscribe((value) => {
      result = value;
    });

    expect(result).toBe(false);
  });

  it('closes every open modal', () => {
    service.closeAll();

    expect(closeAll).toHaveBeenCalledTimes(1);
  });
});
