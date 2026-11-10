import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TrackActionsMenuComponent } from './track-actions-menu.component';
import { TrackActionEnum } from '../../../../core/enums/track-action.enum';
import { TrackStatusEnum } from '../../../../core/enums/track-status.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { TrackStatus } from '../../../../core/types/track-status.type';

describe('TrackActionsMenuComponent', () => {
  const openMenu = async (
    status: TrackStatus,
  ): Promise<ComponentFixture<TrackActionsMenuComponent>> => {
    await TestBed.configureTestingModule({
      imports: [TrackActionsMenuComponent],
    }).compileComponents();
    const fixture: ComponentFixture<TrackActionsMenuComponent> =
      TestBed.createComponent(TrackActionsMenuComponent);
    fixture.componentRef.setInput('status', status);
    fixture.componentRef.setInput('trackTitle', 'Midnight Dreams');
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.actions__trigger')!
      .click();
    await fixture.whenStable();

    return fixture;
  };

  const items = (): string[] =>
    Array.from(document.querySelectorAll('.actions__item'), (item: Element) =>
      item.textContent.trim(),
    );

  it.each([
    [
      TrackStatusEnum.PENDING_REVIEW,
      ['Track details', 'Edit details', 'Download track', 'Cancel submission', 'Delete track'],
    ],
    [
      TrackStatusEnum.APPROVED,
      [
        'Track details',
        'View statistics',
        'Playback schedule',
        'Request schedule change',
        'Download track',
        'Delete track',
      ],
    ],
    [
      TrackStatusEnum.REJECTED,
      [
        'Track details',
        'Edit details',
        'View rejection reason',
        'Resubmit for review',
        'Download track',
        'Delete track',
      ],
    ],
    [
      TrackStatusEnum.DRAFT,
      ['Track details', 'Edit details', 'Submit for review', 'Download track', 'Delete track'],
    ],
  ])('offers the actions of a %s track', async (status: TrackStatus, expected: string[]) => {
    await openMenu(status);

    expect(items()).toEqual(expected);
  });

  it('marks deleting as dangerous', async () => {
    await openMenu(TrackStatusEnum.APPROVED);

    const danger: string[] = Array.from(
      document.querySelectorAll('.actions__item--danger'),
      (item: Element) => item.textContent.trim(),
    );

    expect(danger).toEqual(['Delete track']);
  });

  it('reports the chosen action', async () => {
    const fixture: ComponentFixture<TrackActionsMenuComponent> = await openMenu(
      TrackStatusEnum.DRAFT,
    );
    const selected = vi.fn();
    fixture.componentInstance.actionSelected.subscribe(selected);

    Array.from(document.querySelectorAll<HTMLButtonElement>('.actions__item'))
      .find((item: HTMLButtonElement) => item.textContent.trim() === 'Submit for review')
      ?.click();

    expect(selected).toHaveBeenCalledExactlyOnceWith(TrackActionEnum.SUBMIT);
  });
});
