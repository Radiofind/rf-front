import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GenreShareListComponent } from './genre-share-list.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { IGenreShare } from '../../../models/statistics-view.model';

describe('GenreShareListComponent', () => {
  const createFixture = async (
    shares: IGenreShare[],
  ): Promise<ComponentFixture<GenreShareListComponent>> => {
    await TestBed.configureTestingModule({
      imports: [GenreShareListComponent],
    }).compileComponents();

    const fixture: ComponentFixture<GenreShareListComponent> =
      TestBed.createComponent(GenreShareListComponent);
    fixture.componentRef.setInput('shares', shares);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<GenreShareListComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  it('names each genre with its share of the plays', async () => {
    const fixture: ComponentFixture<GenreShareListComponent> = await createFixture([
      { genre: 'CHILLOUT', label: 'genres.chillout', plays: 42, share: 0.42 },
      { genre: null, label: 'statistics.genres.other', plays: 58, share: 0.58 },
    ]);

    expect(
      Array.from(element(fixture).querySelectorAll('.genres__row'), (row: Element) => [
        row.querySelector('.genres__name')?.textContent.trim(),
        row.querySelector('.genres__share')?.textContent.trim(),
      ]),
    ).toEqual([
      ['Chillout', '42%'],
      ['Other', '58%'],
    ]);
  });

  it('says so when nothing was played in the period', async () => {
    const fixture: ComponentFixture<GenreShareListComponent> = await createFixture([]);

    expect(element(fixture).querySelector('.genres__empty')?.textContent.trim()).toBe(
      'No plays in this period yet',
    );
  });
});
