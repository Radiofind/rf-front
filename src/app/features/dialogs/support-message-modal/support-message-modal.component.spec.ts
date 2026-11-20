import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SupportMessageModalComponent } from './support-message-modal.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ISupportMessageForm } from '../../models/support.model';

describe('SupportMessageModalComponent', () => {
  const createFixture = async (
    close: ReturnType<typeof vi.fn>,
    draft: ISupportMessageForm | null = null,
  ): Promise<ComponentFixture<SupportMessageModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [SupportMessageModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { email: 'ada@example.com', draft: draft } },
        { provide: DialogRef, useValue: { close: close } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<SupportMessageModalComponent> = TestBed.createComponent(
      SupportMessageModalComponent,
    );
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<SupportMessageModalComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const fill = async (
    fixture: ComponentFixture<SupportMessageModalComponent>,
    subject: string,
    message: string,
  ): Promise<void> => {
    const subjectInput: HTMLInputElement = element(fixture).querySelector('input')!;
    subjectInput.value = subject;
    subjectInput.dispatchEvent(new Event('input'));
    const messageInput: HTMLTextAreaElement = element(fixture).querySelector('textarea')!;
    messageInput.value = message;
    messageInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('tells where the answer will arrive', async () => {
    const fixture: ComponentFixture<SupportMessageModalComponent> = await createFixture(vi.fn());

    expect(element(fixture).querySelector('.track-dialog__note')?.textContent).toContain(
      'Our team will reply to ada@example.com.',
    );
  });

  it('closes with the written message as soon as it is sent', async () => {
    const close = vi.fn();
    const fixture: ComponentFixture<SupportMessageModalComponent> = await createFixture(close);

    await fill(fixture, 'Upload stuck', 'My track stays in review');
    element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(close).toHaveBeenCalledExactlyOnceWith({
      subject: 'Upload stuck',
      message: 'My track stays in review',
    });
  });

  it('starts from the draft of a message that failed to send', async () => {
    const fixture: ComponentFixture<SupportMessageModalComponent> = await createFixture(vi.fn(), {
      subject: 'Upload stuck',
      message: 'My track stays in review',
    });

    expect(element(fixture).querySelector('input')!.value).toBe('Upload stuck');
    expect(element(fixture).querySelector('textarea')!.value).toBe('My track stays in review');
  });

  it('cannot be sent without a message', async () => {
    const fixture: ComponentFixture<SupportMessageModalComponent> = await createFixture(vi.fn());

    await fill(fixture, 'Upload stuck', '');

    expect(
      element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
    ).toBe(true);
  });

  it('closes without a message on cancel', async () => {
    const close = vi.fn();
    const fixture: ComponentFixture<SupportMessageModalComponent> = await createFixture(close);

    element(fixture).querySelector<HTMLButtonElement>('button:not([type="submit"])')!.click();

    expect(close).toHaveBeenCalledExactlyOnceWith();
  });
});
