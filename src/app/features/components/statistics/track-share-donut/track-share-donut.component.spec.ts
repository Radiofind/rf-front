import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TrackShareDonutComponent } from './track-share-donut.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITrackShare } from '../../../models/statistics-view.model';

describe('TrackShareDonutComponent', () => {
  const shares: ITrackShare[] = [
    {
      track: {
        id: 1,
        title: 'Without a Smile',
        artistName: 'Neon Lights',
        coverUrl: null,
        status: null,
      },
      plays: 300,
      share: 0.75,
    },
    { track: null, plays: 100, share: 0.25 },
  ];

  const createFixture = async (): Promise<ComponentFixture<TrackShareDonutComponent>> => {
    await TestBed.configureTestingModule({
      imports: [TrackShareDonutComponent],
    }).compileComponents();

    const fixture: ComponentFixture<TrackShareDonutComponent> =
      TestBed.createComponent(TrackShareDonutComponent);
    fixture.componentRef.setInput('shares', shares);
    fixture.componentRef.setInput('totalPlays', 400);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<TrackShareDonutComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const centre = (fixture: ComponentFixture<TrackShareDonutComponent>): (string | undefined)[] => [
    element(fixture).querySelector('.donut__center-value')?.textContent.trim(),
    element(fixture).querySelector('.donut__center-label')?.textContent.trim(),
  ];

  it('labels every part with its track and share, pooling the rest', async () => {
    const fixture: ComponentFixture<TrackShareDonutComponent> = await createFixture();

    expect(
      Array.from(element(fixture).querySelectorAll('.donut__legend-item'), (item: Element) => [
        item.querySelector('.donut__legend-name')?.textContent.trim(),
        item.querySelector('.donut__legend-share')?.textContent.trim(),
      ]),
    ).toEqual([
      ['Without a Smile', '75%'],
      ['Other tracks', '25%'],
    ]);
  });

  it('shows all plays of the period in the centre', async () => {
    const fixture: ComponentFixture<TrackShareDonutComponent> = await createFixture();

    expect(centre(fixture)).toEqual(['400', 'plays']);
  });

  it('shows the share of the focused track in the centre', async () => {
    const fixture: ComponentFixture<TrackShareDonutComponent> = await createFixture();

    element(fixture).querySelector('.donut__legend-item')?.dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();

    expect(centre(fixture)).toEqual(['75%', 'Without a Smile']);
  });
});
