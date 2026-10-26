import { ArtistTypeEnum } from '../../core/enums/artist-type.enum';

import type { ArtistType } from '../../core/types/artist-type.type';
import type { ArtistTypeRequest } from '../../core/types/artist-type-request.type';
import type { TranslationKey } from '../../core/types/translation.type';
import type { ISelectOption } from '../../shared/models/select-option.model';
import type { IArtistTypeTexts } from '../models/artist-type-texts.model';

export const ARTIST_TYPE_LABELS: Readonly<Record<ArtistTypeRequest, ArtistType>> = {
  ARTIST: ArtistTypeEnum.ARTIST,
  BAND: ArtistTypeEnum.BAND,
};

export const ARTIST_TYPE_TEXTS: Readonly<Record<ArtistType, IArtistTypeTexts>> = {
  [ArtistTypeEnum.ARTIST]: {
    role: 'artistType.artistRole',
    name: 'artistType.artistName',
    namePlaceholder: 'artistType.artistNamePlaceholder',
    editName: 'editProfile.artistName',
    about: 'artistType.aboutArtist',
    description: 'artistType.artistDescription',
  },
  [ArtistTypeEnum.BAND]: {
    role: 'artistType.bandRole',
    name: 'artistType.bandName',
    namePlaceholder: 'artistType.bandNamePlaceholder',
    editName: 'editProfile.bandName',
    about: 'artistType.aboutBand',
    description: 'artistType.bandDescription',
  },
};

export const ARTIST_TYPE_OPTIONS: readonly ISelectOption<ArtistType, TranslationKey>[] = [
  { value: ArtistTypeEnum.ARTIST, label: 'artistType.artist' },
  { value: ArtistTypeEnum.BAND, label: 'artistType.band' },
];
