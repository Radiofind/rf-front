import { ModalSizeEnum } from '../../core/enums/modal-size.enum';

import type { ArtistType } from '../../core/types/artist-type.type';
import type { IModalOptions } from '../../shared/models/modal.model';
import type { ITwoFactorModalData } from '../models/two-factor.model';
import type { IAuthContent } from '../models/auth-content.model';

export const AUTH_DESCRIPTION_CONTENT_LOGIN: IAuthContent = {
  title: 'auth.login.descriptionTitle',
  titleColor: 'auth.login.descriptionAccent',
  smile: ' 👋',
  instructions: 'auth.login.instructions',
  content: [
    {
      id: '1',
      iconClass: 'bx bx-equalizer',
      contentTitle: 'auth.features.worldwideTitle',
      overview: 'auth.features.worldwideOverview',
    },
    {
      id: '2',
      iconClass: 'bx bx-trending-up',
      contentTitle: 'auth.features.progressTitle',
      overview: 'auth.features.progressOverview',
    },
    {
      id: '3',
      iconClass: 'bx bx-check-shield',
      contentTitle: 'auth.features.secureTitle',
      overview: 'auth.features.secureOverview',
    },
  ],
};

export const AUTH_DESCRIPTION_CONTENT_REGISTER: IAuthContent = {
  title: 'auth.register.descriptionTitle',
  titleColor: 'auth.register.descriptionAccent',
  instructions: 'auth.register.instructions',
  content: [
    {
      id: '1',
      iconClass: 'bx bx-music',
      contentTitle: 'auth.features.heardTitle',
      overview: 'auth.features.heardOverview',
    },
    {
      id: '2',
      iconClass: 'bx bx-trending-up',
      contentTitle: 'auth.features.statsTitle',
      overview: 'auth.features.statsOverview',
    },
    {
      id: '3',
      iconClass: 'bx bx-check-shield',
      contentTitle: 'auth.features.secureTitle',
      overview: 'auth.features.secureOverview',
    },
  ],
};

export const ARTIST_TYPES = ['Artist', 'Band'] as const satisfies readonly ArtistType[];

export const DEFAULT_ARTIST_TYPE: ArtistType = ARTIST_TYPES[0];

export const TWO_FACTOR_MODAL_OPTIONS: IModalOptions<ITwoFactorModalData> = {
  size: ModalSizeEnum.MEDIUM,
  hasHeader: false,
  ariaLabel: 'twoFactor.title',
};

export const FORGET_PASSWORD_MODAL_OPTIONS: IModalOptions = {
  size: ModalSizeEnum.MEDIUM,
  hasHeader: false,
  ariaLabel: 'forgotPassword.ariaLabel',
};
