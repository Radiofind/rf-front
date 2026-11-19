import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TopTracksListComponent } from './top-tracks-list.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('TopTracksListComponent', () => {
  it('ranks the tracks with their plays of the period', async () => {
    await TestBed.configureTestingModule({
      imports: [TopTracksListComponent],
    }).compileComponents();
    const fixture: ComponentFixture<TopTracksListComponent> =
      TestBed.createComponent(TopTracksListComponent);
    fixture.componentRef.setInput('tracks', [
      {
        track: {
          id: 7,
          title: 'Without a Smile',
          artistName: 'Neon Lights',
          coverUrl: '/api/tracks/7/cover',
          status: null,
        },
        plays: 124000,
      },
      {
        track: {
          id: 8,
          title: 'Night Drive',
          artistName: 'Neon Lights',
          coverUrl: null,
          status: null,
        },
        plays: 98000,
      },
    ]);
    await fixture.whenStable();

    expect(
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.top-tracks__row'),
        (row: Element) => [
          row.querySelector('.top-tracks__rank')?.textContent.trim(),
          row.querySelector('.top-tracks__name')?.textContent.trim(),
          row.querySelector('.top-tracks__plays-value')?.textContent.trim(),
        ],
      ),
    ).toEqual([
      ['1', 'Without a Smile', '124K'],
      ['2', 'Night Drive', '98K'],
    ]);
  });
});
