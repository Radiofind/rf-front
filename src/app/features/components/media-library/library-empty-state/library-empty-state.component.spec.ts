import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LibraryEmptyStateComponent } from './library-empty-state.component';
import { LibraryEmptyStateEnum } from '../../../enums/library-empty-state.enum';

import type { ComponentFixture } from '@angular/core/testing';

describe('LibraryEmptyStateComponent', () => {
  const createFixture = async (
    kind: LibraryEmptyStateEnum,
    search: string = '',
  ): Promise<ComponentFixture<LibraryEmptyStateComponent>> => {
    await TestBed.configureTestingModule({
      imports: [LibraryEmptyStateComponent],
    }).compileComponents();
    const fixture: ComponentFixture<LibraryEmptyStateComponent> = TestBed.createComponent(
      LibraryEmptyStateComponent,
    );
    fixture.componentRef.setInput('kind', kind);
    fixture.componentRef.setInput('search', search);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<LibraryEmptyStateComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  it('explains to a new listener how tracks get into the library', async () => {
    const fixture: ComponentFixture<LibraryEmptyStateComponent> = await createFixture(
      LibraryEmptyStateEnum.EMPTY_LIBRARY,
    );

    const steps: string[] = Array.from(
      element(fixture).querySelectorAll('.empty-library__step-title'),
      (step: Element) => step.textContent.trim(),
    );

    expect(element(fixture).querySelector('.empty-library__title')?.textContent.trim()).toBe(
      'Your library is waiting for its first track',
    );
    expect(steps).toEqual(['Listen', 'Like', 'Collect']);
  });

  it('names the search that found nothing and offers to clear it', async () => {
    const fixture: ComponentFixture<LibraryEmptyStateComponent> = await createFixture(
      LibraryEmptyStateEnum.NO_SEARCH_MATCH,
      ' neon ',
    );
    const resetClicked = vi.fn();
    fixture.componentInstance.resetClicked.subscribe(resetClicked);

    element(fixture).querySelector<HTMLButtonElement>('.no-match__action')?.click();

    expect(element(fixture).textContent).toContain('Nothing found for "neon"');
    expect(resetClicked).toHaveBeenCalledOnce();
  });

  it('offers a retry when the library could not be loaded', async () => {
    const fixture: ComponentFixture<LibraryEmptyStateComponent> = await createFixture(
      LibraryEmptyStateEnum.LOAD_FAILED,
    );
    const retryClicked = vi.fn();
    fixture.componentInstance.retryClicked.subscribe(retryClicked);

    element(fixture).querySelector<HTMLButtonElement>('.no-match__action')?.click();

    expect(element(fixture).querySelector('[role="alert"]')).not.toBeNull();
    expect(retryClicked).toHaveBeenCalledOnce();
  });
});
