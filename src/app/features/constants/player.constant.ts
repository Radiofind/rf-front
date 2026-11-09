import { RepeatModeEnum } from '../../core/enums/repeat-mode.enum';

import type { TranslationKey } from '../../core/types/translation.type';

export const NEXT_REPEAT_MODE: Readonly<Record<RepeatModeEnum, RepeatModeEnum>> = {
  [RepeatModeEnum.OFF]: RepeatModeEnum.ALL,
  [RepeatModeEnum.ALL]: RepeatModeEnum.ONE,
  [RepeatModeEnum.ONE]: RepeatModeEnum.OFF,
};

export const REPEAT_MODE_LABELS: Readonly<Record<RepeatModeEnum, TranslationKey>> = {
  [RepeatModeEnum.OFF]: 'player.repeatOff',
  [RepeatModeEnum.ALL]: 'player.repeatAll',
  [RepeatModeEnum.ONE]: 'player.repeatOne',
};
