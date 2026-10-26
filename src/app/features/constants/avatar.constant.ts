import type { TranslationKey } from '../../core/types/translation.type';

export const AVATAR_MAX_SIZE_MB: number = 5;

export const AVATAR_MAX_SIZE_BYTES: number = AVATAR_MAX_SIZE_MB * 1024 * 1024;

export const AVATAR_ALLOWED_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];

export const AVATAR_ACCEPT: string = AVATAR_ALLOWED_TYPES.join(',');

export const AVATAR_MESSAGES = {
  invalidType: 'avatar.invalidType',
  tooLarge: 'avatar.tooLarge',
  uploaded: 'messages.avatarUpdated',
  removed: 'messages.avatarRemoved',
  uploadFailed: 'messages.avatarUploadFailed',
  removeFailed: 'messages.avatarRemoveFailed',
} as const satisfies Readonly<Record<string, TranslationKey>>;
