import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LiveChatComponent } from './live-chat.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('LiveChatComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<LiveChatComponent>> => {
    await TestBed.configureTestingModule({ imports: [LiveChatComponent] }).compileComponents();
    const fixture: ComponentFixture<LiveChatComponent> = TestBed.createComponent(LiveChatComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<LiveChatComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const type = async (
    fixture: ComponentFixture<LiveChatComponent>,
    text: string,
  ): Promise<void> => {
    const input: HTMLInputElement = element(fixture).querySelector('input')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const bubbles = (fixture: ComponentFixture<LiveChatComponent>): string[] =>
    Array.from(element(fixture).querySelectorAll('.chat__bubble'), (bubble) =>
      bubble.textContent.trim(),
    );

  it('shows that nobody is online', async () => {
    const fixture: ComponentFixture<LiveChatComponent> = await createFixture();

    expect(element(fixture).querySelector('.chat__status')?.textContent.trim()).toBe('Offline');
    expect(bubbles(fixture)).toEqual(['Hi! This is the RADIOFIND support chat.']);
  });

  it('posts the typed message and empties the input', async () => {
    const fixture: ComponentFixture<LiveChatComponent> = await createFixture();

    await type(fixture, 'My upload is stuck');
    element(fixture).querySelector<HTMLButtonElement>('.chat__send')!.click();
    await fixture.whenStable();

    expect(element(fixture).querySelector('.chat__message--own .chat__bubble')?.textContent).toBe(
      'My upload is stuck',
    );
    expect(element(fixture).querySelector('input')!.value).toBe('');
  });

  it('cannot send an empty message', async () => {
    const fixture: ComponentFixture<LiveChatComponent> = await createFixture();

    await type(fixture, '   ');

    expect(element(fixture).querySelector<HTMLButtonElement>('.chat__send')!.disabled).toBe(true);
  });

  it('closes from the close button', async () => {
    const fixture: ComponentFixture<LiveChatComponent> = await createFixture();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    element(fixture).querySelector<HTMLButtonElement>('.chat__close')!.click();

    expect(closed).toHaveBeenCalledOnce();
  });

  it('closes on Escape', async () => {
    const fixture: ComponentFixture<LiveChatComponent> = await createFixture();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    element(fixture)
      .querySelector('.chat')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(closed).toHaveBeenCalledOnce();
  });
});
