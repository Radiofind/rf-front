import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SupportPageComponent } from './support-page.component';
import { SupportContactService } from '../../../features/services/support-contact-service/support-contact.service';

import type { ComponentFixture } from '@angular/core/testing';

describe('SupportPageComponent', () => {
  const createFixture = async (
    openMessageForm: ReturnType<typeof vi.fn> = vi.fn(),
  ): Promise<ComponentFixture<SupportPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [SupportPageComponent],
      providers: [
        provideRouter([]),
        { provide: SupportContactService, useValue: { openMessageForm: openMessageForm } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<SupportPageComponent> =
      TestBed.createComponent(SupportPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<SupportPageComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const channel = (
    fixture: ComponentFixture<SupportPageComponent>,
    label: string,
  ): HTMLButtonElement | undefined =>
    Array.from(element(fixture).querySelectorAll<HTMLButtonElement>('.support__channel')).find(
      (button: HTMLButtonElement) => button.textContent.includes(label),
    );

  it('links every help topic to its questions', async () => {
    const fixture: ComponentFixture<SupportPageComponent> = await createFixture();

    const topics: [string, string | null][] = Array.from(
      element(fixture).querySelectorAll<HTMLAnchorElement>('.support__topic'),
      (link: HTMLAnchorElement) => [link.textContent.trim(), link.getAttribute('href')],
    );

    expect(topics).toEqual([
      ['FAQ', '/support/faq'],
      ['Playback Issues', '/support/faq?category=playback'],
      ['Uploading Music', '/support/faq?category=uploading'],
      ['Premium Account', '/support/faq?category=premium'],
      ['Other Issues', '/support/faq?category=account'],
    ]);
  });

  it('shows the most common questions with a link to all of them', async () => {
    const fixture: ComponentFixture<SupportPageComponent> = await createFixture();

    expect(
      Array.from(element(fixture).querySelectorAll('.faq__question'), (question) =>
        question.textContent.trim(),
      ),
    ).toEqual([
      'How do I upload my music?',
      'Why is my music not playing?',
      'How to get Premium?',
      'Can I download music offline?',
      'How to contact support?',
    ]);
    expect(element(fixture).querySelector('.support__view-all')?.getAttribute('href')).toBe(
      '/support/faq',
    );
  });

  it('opens the message form', async () => {
    const openMessageForm = vi.fn();
    const fixture: ComponentFixture<SupportPageComponent> = await createFixture(openMessageForm);

    element(fixture).querySelector<HTMLButtonElement>('.support__send button')!.click();

    expect(openMessageForm).toHaveBeenCalledOnce();
  });

  it('opens and closes the live chat', async () => {
    const fixture: ComponentFixture<SupportPageComponent> = await createFixture();

    channel(fixture, 'Live Chat')!.click();
    await fixture.whenStable();

    expect(element(fixture).querySelector('app-live-chat')).not.toBeNull();

    element(fixture).querySelector<HTMLButtonElement>('.chat__close')!.click();
    await fixture.whenStable();

    expect(element(fixture).querySelector('app-live-chat')).toBeNull();
  });

  it('offers Discord only as coming soon', async () => {
    const fixture: ComponentFixture<SupportPageComponent> = await createFixture();

    expect(channel(fixture, 'Join Discord')?.disabled).toBe(true);
    expect(channel(fixture, 'Join Discord')?.textContent).toContain('Coming soon');
  });
});
