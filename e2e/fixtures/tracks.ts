import { expect } from '@playwright/test';
import { API_URL } from './api';
import { melodyWav, randomSeed } from './audio';

import type { APIRequestContext, APIResponse } from '@playwright/test';

export const TRACKS_URL: string = `${API_URL}/tracks`;

export const OWN_TRACKS_URL: string = `${API_URL}/users/me/tracks`;

export const GENERAL_SETTINGS_URL: string = `${API_URL}/users/me/settings/general`;

export const PNG_BYTES: Buffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
);

export const bearer = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

export const uploadTrack = (
  request: APIRequestContext,
  token: string,
  fields: Record<string, string> = { title: 'Midnight Dreams', genres: 'GRUNGE' },
  audio: Buffer = melodyWav(randomSeed()),
): Promise<APIResponse> =>
  request.post(TRACKS_URL, {
    headers: bearer(token),
    multipart: {
      ...fields,
      audio: { name: 'song.wav', mimeType: 'audio/wav', buffer: audio },
      cover: { name: 'cover.png', mimeType: 'image/png', buffer: PNG_BYTES },
    },
  });

export const uploadTitled = async (
  request: APIRequestContext,
  token: string,
  title: string,
  genres: string = 'GRUNGE',
): Promise<void> => {
  const response: APIResponse = await uploadTrack(request, token, { title: title, genres: genres });

  expect(response.status(), `upload of "${title}" failed`).toBe(201);
};

export const setRadioMode = async (
  request: APIRequestContext,
  token: string,
  radioMode: boolean,
): Promise<void> => {
  const current: APIResponse = await request.get(GENERAL_SETTINGS_URL, {
    headers: bearer(token),
  });
  const saved: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
    headers: bearer(token),
    data: { ...((await current.json()) as Record<string, unknown>), radioMode: radioMode },
  });

  expect(saved.status(), 'radio mode could not be saved').toBe(200);
};
