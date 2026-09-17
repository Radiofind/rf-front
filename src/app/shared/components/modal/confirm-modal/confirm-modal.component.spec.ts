import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ConfirmModalComponent } from './confirm-modal.component';
import { Constants } from '../../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';
import type { IConfirmModalData } from '../../../models/modal.model';

describe('ConfirmModalComponent', () => {
  let close: ReturnType<typeof vi.fn>;

  const createFixture = async (
    data: IConfirmModalData,
  ): Promise<ComponentFixture<ConfirmModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        { provide: DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    return TestBed.createComponent(ConfirmModalComponent);
  };

  const buttonsOf = (fixture: ComponentFixture<ConfirmModalComponent>): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('button'));

  beforeEach(() => {
    close = vi.fn();
  });

  it('renders the message and falls back to the default button labels', async () => {
    const fixture: ComponentFixture<ConfirmModalComponent> = await createFixture({
      message: 'Delete this track?',
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.confirm__message').textContent).toBe('Delete this track?');
    expect(fixture.componentInstance.confirmText).toBe(Constants.MODAL_DEFAULT_CONFIRM_TEXT);
    expect(fixture.componentInstance.cancelText).toBe(Constants.MODAL_DEFAULT_CANCEL_TEXT);
  });

  it('hides the description when none is given', async () => {
    const fixture: ComponentFixture<ConfirmModalComponent> = await createFixture({
      message: 'Delete this track?',
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.confirm__description')).toBeNull();
  });

  it('renders custom labels and the description', async () => {
    const fixture: ComponentFixture<ConfirmModalComponent> = await createFixture({
      message: 'Delete this track?',
      description: 'This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.confirm__description').textContent).toBe(
      'This cannot be undone.',
    );
    expect(fixture.componentInstance.confirmText).toBe('Delete');
    expect(fixture.componentInstance.cancelText).toBe('Keep');
  });

  it('closes with true from the confirm button', async () => {
    const fixture: ComponentFixture<ConfirmModalComponent> = await createFixture({
      message: 'Delete this track?',
    });
    await fixture.whenStable();

    buttonsOf(fixture)[1]?.click();

    expect(close).toHaveBeenCalledWith(true);
  });

  it('closes with false from the cancel button', async () => {
    const fixture: ComponentFixture<ConfirmModalComponent> = await createFixture({
      message: 'Delete this track?',
    });
    await fixture.whenStable();

    buttonsOf(fixture)[0]?.click();

    expect(close).toHaveBeenCalledWith(false);
  });
});
