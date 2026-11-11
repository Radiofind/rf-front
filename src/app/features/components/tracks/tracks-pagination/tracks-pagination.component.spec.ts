import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TracksPaginationComponent } from './tracks-pagination.component';
import { SelectFieldComponent } from '../../../../shared/components/select-field/select-field.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('TracksPaginationComponent', () => {
  const createFixture = async (
    page: number,
    totalPages: number,
  ): Promise<ComponentFixture<TracksPaginationComponent>> => {
    await TestBed.configureTestingModule({
      imports: [TracksPaginationComponent],
    }).compileComponents();
    const fixture: ComponentFixture<TracksPaginationComponent> =
      TestBed.createComponent(TracksPaginationComponent);
    fixture.componentRef.setInput('label', 'Library pages');
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.componentRef.setInput('visiblePages', [0, 1, 2]);
    fixture.componentRef.setInput('rangeStart', 11);
    fixture.componentRef.setInput('rangeEnd', 20);
    fixture.componentRef.setInput('totalElements', 25);
    fixture.componentRef.setInput('pageSize', 10);
    await fixture.whenStable();

    return fixture;
  };

  const button = (
    fixture: ComponentFixture<TracksPaginationComponent>,
    label: string,
  ): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    )!;

  it('shows which tracks of how many are on screen', async () => {
    const fixture: ComponentFixture<TracksPaginationComponent> = await createFixture(1, 3);

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.tracks-pagination__range')
        ?.textContent.trim(),
    ).toBe('Showing 11–20 of 25');
  });

  it('asks for the clicked page', async () => {
    const fixture: ComponentFixture<TracksPaginationComponent> = await createFixture(1, 3);
    const pageSelected = vi.fn();
    fixture.componentInstance.pageSelected.subscribe(pageSelected);

    button(fixture, 'Next page').click();

    expect(pageSelected).toHaveBeenCalledExactlyOnceWith(2);
  });

  it.each([
    ['the current page', 1],
    ['a page past the end', 2],
    ['a page before the first', -1],
  ])('ignores %s', async (_: string, page: number) => {
    const fixture: ComponentFixture<TracksPaginationComponent> = await createFixture(1, 2);
    const pageSelected = vi.fn();
    fixture.componentInstance.pageSelected.subscribe(pageSelected);

    fixture.componentInstance.onPageSelect(page);

    expect(pageSelected).not.toHaveBeenCalled();
  });

  it('asks for the page size chosen in the dropdown as a number', async () => {
    const fixture: ComponentFixture<TracksPaginationComponent> = await createFixture(0, 3);
    const pageSizeSelected = vi.fn();
    fixture.componentInstance.pageSizeSelected.subscribe(pageSizeSelected);
    const select: SelectFieldComponent<string> = fixture.debugElement.query(
      By.directive(SelectFieldComponent),
    ).componentInstance as SelectFieldComponent<string>;

    select.onSelect('50');

    expect(pageSizeSelected).toHaveBeenCalledExactlyOnceWith(50);
  });
});
