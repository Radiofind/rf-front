import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FaqPageComponent } from './faq-page.component';
import { SupportContactService } from '../../../features/services/support-contact-service/support-contact.service';

describe('FaqPageComponent', () => {
  const openPage = async (
    url: string,
    openMessageForm: ReturnType<typeof vi.fn> = vi.fn(),
  ): Promise<RouterTestingHarness> => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'support/faq', component: FaqPageComponent }]),
        { provide: SupportContactService, useValue: { openMessageForm: openMessageForm } },
      ],
    });
    const harness: RouterTestingHarness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, FaqPageComponent);

    return harness;
  };

  const element = (harness: RouterTestingHarness): HTMLElement => harness.routeNativeElement!;

  const groupTitles = (harness: RouterTestingHarness): string[] =>
    Array.from(element(harness).querySelectorAll('.faq-page__group-title'), (title) =>
      title.textContent.trim(),
    );

  const questions = (harness: RouterTestingHarness): string[] =>
    Array.from(element(harness).querySelectorAll('.faq__question'), (question) =>
      question.textContent.trim(),
    );

  const search = async (harness: RouterTestingHarness, text: string): Promise<void> => {
    const input: HTMLInputElement = element(harness).querySelector('input[type="search"]')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
  };

  it('groups all questions by topic', async () => {
    const harness: RouterTestingHarness = await openPage('/support/faq');

    expect(groupTitles(harness)).toEqual(['Playback', 'Uploading', 'Premium', 'Account & other']);
    expect(questions(harness)).toHaveLength(21);
  });

  it('shows only the topic named in the address', async () => {
    const harness: RouterTestingHarness = await openPage('/support/faq?category=premium');

    expect(groupTitles(harness)).toEqual(['Premium']);
    expect(questions(harness)).toEqual(['How to get Premium?', 'What does Premium include?']);
    expect(element(harness).querySelector('.faq-page__tab--active')?.textContent.trim()).toBe(
      'Premium',
    );
  });

  it('falls back to all topics for an unknown topic', async () => {
    const harness: RouterTestingHarness = await openPage('/support/faq?category=billing');

    expect(groupTitles(harness)).toHaveLength(4);
  });

  it('puts the chosen topic into the address', async () => {
    const harness: RouterTestingHarness = await openPage('/support/faq');

    Array.from(element(harness).querySelectorAll<HTMLButtonElement>('.faq-page__tab'))
      .find((tab: HTMLButtonElement) => tab.textContent.trim() === 'Playback')!
      .click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/support/faq?category=playback');
  });

  it('finds questions by words of their answers', async () => {
    const harness: RouterTestingHarness = await openPage('/support/faq');

    await search(harness, 'AUTHENTICATOR');

    expect(questions(harness)).toEqual(['How do I change where my sign-in codes are sent?']);
  });

  it('offers to clear a search without results', async () => {
    const harness: RouterTestingHarness = await openPage('/support/faq');

    await search(harness, 'karaoke');

    expect(element(harness).querySelector('.faq-page__empty')?.textContent).toContain(
      'No answers for "karaoke"',
    );

    element(harness).querySelector<HTMLButtonElement>('.faq-page__empty button')!.click();
    await harness.fixture.whenStable();

    expect(questions(harness)).toHaveLength(21);
  });

  it('opens the message form for questions left open', async () => {
    const openMessageForm = vi.fn();
    const harness: RouterTestingHarness = await openPage('/support/faq', openMessageForm);

    element(harness).querySelector<HTMLButtonElement>('.faq-page__help-action button')!.click();

    expect(openMessageForm).toHaveBeenCalledOnce();
  });
});
