import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GenreLabelService } from './genre-label.service';

describe('GenreLabelService', () => {
  it('joins the readable names of known genres', () => {
    const service: GenreLabelService = TestBed.inject(GenreLabelService);

    expect(service.join(['CLASSIC_ROCK', 'HARD_ROCK'])).toBe('Classic Rock / Hard Rock');
  });

  it('turns an unknown genre code into words', () => {
    const service: GenreLabelService = TestBed.inject(GenreLabelService);

    expect(service.join(['SPACE_DISCO'])).toBe('Space Disco');
  });

  it.each([[undefined], [[]]])('has nothing to show for %j', (genres: string[] | undefined) => {
    const service: GenreLabelService = TestBed.inject(GenreLabelService);

    expect(service.join(genres)).toBeNull();
  });
});
