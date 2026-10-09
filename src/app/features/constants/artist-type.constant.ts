import { ArtistTypeEnum } from '../../core/enums/artist-type.enum';

import type { ArtistType } from '../../core/types/artist-type.type';
import type { ArtistTypeRequest } from '../../core/types/artist-type-request.type';

export const ARTIST_TYPE_LABELS: Readonly<Record<ArtistTypeRequest, ArtistType>> = {
  ARTIST: ArtistTypeEnum.ARTIST,
  BAND: ArtistTypeEnum.BAND,
};

export const ARTIST_ROLE_LABELS: Readonly<Record<ArtistTypeRequest, string>> = {
  ARTIST: 'Artist',
  BAND: 'Member of band',
};
