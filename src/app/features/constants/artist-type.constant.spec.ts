import { describe, expect, it } from 'vitest';
import { ARTIST_ROLE_LABELS, ARTIST_TYPE_LABELS } from './artist-type.constant';
import { ArtistTypeRequestEnum } from '../../core/enums/artist-type.enum';

describe('artist type labels', () => {
  it('maps every backend artist type to a display label', () => {
    expect(ARTIST_TYPE_LABELS[ArtistTypeRequestEnum.ARTIST]).toBe('Artist');
    expect(ARTIST_TYPE_LABELS[ArtistTypeRequestEnum.BAND]).toBe('Band');
  });

  it('maps every backend artist type to a role label', () => {
    expect(ARTIST_ROLE_LABELS[ArtistTypeRequestEnum.ARTIST]).toBe('Artist');
    expect(ARTIST_ROLE_LABELS[ArtistTypeRequestEnum.BAND]).toBe('Member of band');
  });
});
