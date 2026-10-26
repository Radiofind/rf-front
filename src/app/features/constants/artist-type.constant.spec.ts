import { describe, expect, it } from 'vitest';
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_OPTIONS, ARTIST_TYPE_TEXTS } from './artist-type.constant';
import { ArtistTypeEnum, ArtistTypeRequestEnum } from '../../core/enums/artist-type.enum';

describe('artist type labels', () => {
  it('maps every backend artist type to a form value', () => {
    expect(ARTIST_TYPE_LABELS[ArtistTypeRequestEnum.ARTIST]).toBe('Artist');
    expect(ARTIST_TYPE_LABELS[ArtistTypeRequestEnum.BAND]).toBe('Band');
  });

  it('maps every artist type to its role translation key', () => {
    expect(ARTIST_TYPE_TEXTS[ArtistTypeEnum.ARTIST].role).toBe('artistType.artistRole');
    expect(ARTIST_TYPE_TEXTS[ArtistTypeEnum.BAND].role).toBe('artistType.bandRole');
  });

  it('offers an option for every artist type', () => {
    expect(ARTIST_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      ArtistTypeEnum.ARTIST,
      ArtistTypeEnum.BAND,
    ]);
  });
});
