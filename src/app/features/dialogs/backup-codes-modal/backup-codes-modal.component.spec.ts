import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BackupCodesModalComponent } from './backup-codes-modal.component';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';

import type { ComponentFixture } from '@angular/core/testing';

describe('BackupCodesModalComponent', () => {
  let copy: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;

  const createFixture = async (): Promise<ComponentFixture<BackupCodesModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [BackupCodesModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: DIALOG_DATA, useValue: { codes: ['ABCDE-FGHJK', 'KMNPQ-RSTVW'] } },
        { provide: Clipboard, useValue: { copy: copy } },
        { provide: SnackbarService, useValue: { success: success } },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<BackupCodesModalComponent> =
      TestBed.createComponent(BackupCodesModalComponent);
    await fixture.whenStable();

    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    copy = vi.fn().mockReturnValue(true);
    success = vi.fn();
  });

  it('lists every generated code', async () => {
    const fixture: ComponentFixture<BackupCodesModalComponent> = await createFixture();

    const codes: string[] = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.backup-codes__code'),
    ).map((code) => code.textContent.trim());

    expect(codes).toEqual(['ABCDE-FGHJK', 'KMNPQ-RSTVW']);
  });

  it('copies the codes one per line', async () => {
    const fixture: ComponentFixture<BackupCodesModalComponent> = await createFixture();

    fixture.componentInstance.onCopy();

    expect(copy).toHaveBeenCalledWith('ABCDE-FGHJK\nKMNPQ-RSTVW');
    expect(success).toHaveBeenCalledWith('accountSettings.backupCodesCopied');
  });
});
