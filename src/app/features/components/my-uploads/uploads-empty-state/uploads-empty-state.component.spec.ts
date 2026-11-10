import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UploadsEmptyStateComponent } from './uploads-empty-state.component';
import { UploadsEmptyStateEnum } from '../../../enums/uploads-empty-state.enum';
import { TrackStatusEnum } from '../../../../core/enums/track-status.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { TrackStatus } from '../../../../core/types/track-status.type';

describe('UploadsEmptyStateComponent', () => {
  const createFixture = async (
    kind: UploadsEmptyStateEnum,
    status: TrackStatus | null = null,
    search: string = '',
  ): Promise<ComponentFixture<UploadsEmptyStateComponent>> => {
    await TestBed.configureTestingModule({
      imports: [UploadsEmptyStateComponent],
    }).compileComponents();

    const fixture: ComponentFixture<UploadsEmptyStateComponent> = TestBed.createComponent(
      UploadsEmptyStateComponent,
    );
    fixture.componentRef.setInput('kind', kind);
    fixture.componentRef.setInput('status', status);
    fixture.componentRef.setInput('search', search);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<UploadsEmptyStateComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  it('walks an artist without uploads through the path to publication', async () => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.NO_UPLOADS,
    );

    const steps: string[] = Array.from(
      element(fixture).querySelectorAll('.first-upload__step-title'),
      (step: Element) => step.textContent.trim(),
    );

    expect(element(fixture).querySelector('.first-upload__title')?.textContent.trim()).toBe(
      'Your stage is still empty',
    );
    expect(steps).toEqual(['Upload', 'Processing', 'Published']);
  });

  it('asks to upload the first track', async () => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.NO_UPLOADS,
    );
    const uploadClicked = vi.fn();
    fixture.componentInstance.uploadClicked.subscribe(uploadClicked);

    element(fixture).querySelector<HTMLButtonElement>('.first-upload__cta')?.click();

    expect(uploadClicked).toHaveBeenCalledOnce();
  });

  it.each([
    [TrackStatusEnum.APPROVED, 'No published tracks yet'],
    [TrackStatusEnum.PENDING_REVIEW, 'Nothing in review right now'],
    [TrackStatusEnum.REJECTED, 'No rejected tracks'],
  ])('names the empty %s tab as "%s"', async (status: TrackStatus, title: string) => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.NO_STATUS_MATCH,
      status,
    );

    expect(element(fixture).querySelector('.empty__title')?.textContent.trim()).toBe(title);
  });

  it('leads from an empty status tab back to all uploads', async () => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.NO_STATUS_MATCH,
      TrackStatusEnum.REJECTED,
    );
    const resetClicked = vi.fn();
    fixture.componentInstance.resetClicked.subscribe(resetClicked);

    element(fixture).querySelector<HTMLButtonElement>('.no-match__action')?.click();

    expect(resetClicked).toHaveBeenCalledOnce();
  });

  it('repeats the searched text without surrounding spaces', async () => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.NO_SEARCH_MATCH,
      null,
      '  neon  ',
    );

    expect(element(fixture).querySelector('.empty__title')?.textContent.trim()).toBe(
      'Nothing found for "neon"',
    );
  });

  it('clears the search that found nothing', async () => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.NO_SEARCH_MATCH,
      null,
      'neon',
    );
    const resetClicked = vi.fn();
    fixture.componentInstance.resetClicked.subscribe(resetClicked);

    element(fixture).querySelector<HTMLButtonElement>('.no-match__action')?.click();

    expect(resetClicked).toHaveBeenCalledOnce();
  });

  it('announces a failed load and offers to retry', async () => {
    const fixture: ComponentFixture<UploadsEmptyStateComponent> = await createFixture(
      UploadsEmptyStateEnum.LOAD_FAILED,
    );
    const retryClicked = vi.fn();
    fixture.componentInstance.retryClicked.subscribe(retryClicked);

    element(fixture).querySelector<HTMLButtonElement>('.no-match__action')?.click();

    expect(element(fixture).querySelector('[role="alert"]')).not.toBeNull();
    expect(retryClicked).toHaveBeenCalledOnce();
  });
});
