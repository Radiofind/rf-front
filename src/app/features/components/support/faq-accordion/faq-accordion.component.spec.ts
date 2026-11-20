import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FaqAccordionComponent } from './faq-accordion.component';
import { FaqCategoryEnum } from '../../../../core/enums/faq-category.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { IFaqItem } from '../../../models/support.model';

describe('FaqAccordionComponent', () => {
  const items: readonly IFaqItem[] = [
    {
      id: 'uploadHow',
      category: FaqCategoryEnum.UPLOADING,
      question: 'support.questions.uploadHow.question',
      answer: 'support.questions.uploadHow.answer',
    },
    {
      id: 'premiumHow',
      category: FaqCategoryEnum.PREMIUM,
      question: 'support.questions.premiumHow.question',
      answer: 'support.questions.premiumHow.answer',
    },
  ];

  const createFixture = async (): Promise<ComponentFixture<FaqAccordionComponent>> => {
    await TestBed.configureTestingModule({ imports: [FaqAccordionComponent] }).compileComponents();
    const fixture: ComponentFixture<FaqAccordionComponent> =
      TestBed.createComponent(FaqAccordionComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<FaqAccordionComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const questions = (fixture: ComponentFixture<FaqAccordionComponent>): HTMLButtonElement[] =>
    Array.from(element(fixture).querySelectorAll<HTMLButtonElement>('.faq__question'));

  it('lists every question collapsed', async () => {
    const fixture: ComponentFixture<FaqAccordionComponent> = await createFixture();

    expect(questions(fixture).map((button) => button.textContent.trim())).toEqual([
      'How do I upload my music?',
      'How to get Premium?',
    ]);
    expect(element(fixture).querySelector('.faq__answer')).toBeNull();
  });

  it('reveals the answer of the clicked question', async () => {
    const fixture: ComponentFixture<FaqAccordionComponent> = await createFixture();

    questions(fixture)[1]!.click();
    await fixture.whenStable();

    expect(questions(fixture)[1]!.getAttribute('aria-expanded')).toBe('true');
    expect(element(fixture).querySelector('.faq__answer')?.textContent).toContain(
      'Premium cannot be bought in the app yet.',
    );
  });

  it('hides the answer again on a second click', async () => {
    const fixture: ComponentFixture<FaqAccordionComponent> = await createFixture();

    questions(fixture)[0]!.click();
    await fixture.whenStable();
    questions(fixture)[0]!.click();
    await fixture.whenStable();

    expect(questions(fixture)[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(element(fixture).querySelector('.faq__answer')).toBeNull();
  });

  it('keeps several answers open at once', async () => {
    const fixture: ComponentFixture<FaqAccordionComponent> = await createFixture();

    questions(fixture)[0]!.click();
    questions(fixture)[1]!.click();
    await fixture.whenStable();

    expect(element(fixture).querySelectorAll('.faq__answer')).toHaveLength(2);
  });
});
