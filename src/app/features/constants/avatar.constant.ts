export const AVATAR_MAX_SIZE_MB: number = 5;

export const AVATAR_MAX_SIZE_BYTES: number = AVATAR_MAX_SIZE_MB * 1024 * 1024;

export const AVATAR_ALLOWED_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];

export const AVATAR_ACCEPT: string = AVATAR_ALLOWED_TYPES.join(',');

export const AVATAR_MESSAGES = {
  invalidType: 'Only JPEG, PNG and WebP images are allowed',
  tooLarge: `Image must not exceed ${String(AVATAR_MAX_SIZE_MB)} MB`,
  uploaded: 'Avatar updated',
  removed: 'Avatar removed',
  uploadFailed: 'Could not upload the avatar. Please try again',
  removeFailed: 'Could not remove the avatar. Please try again',
} as const;
