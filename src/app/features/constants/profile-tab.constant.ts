import { Constants } from '../../core/constants/constants';
import { ProfileTabEnum } from '../enums/profile-tab.enum';

import type { TranslationKey } from '../../core/types/translation.type';

export const PROFILE_TAB_LABELS: Readonly<Record<ProfileTabEnum, TranslationKey>> = {
  [ProfileTabEnum.ABOUT]: 'profile.about',
  [ProfileTabEnum.STATISTICS]: 'profile.stats',
};

export const PROFILE_TAB_STEPS: Readonly<Record<string, number>> = {
  [Constants.ARROW_LEFT_KEY]: -1,
  [Constants.ARROW_RIGHT_KEY]: 1,
};
