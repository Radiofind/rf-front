import { expect, request } from '@playwright/test';

import type { APIRequestContext } from '@playwright/test';

export const API_URL: string = process.env['E2E_API_URL'] ?? 'http://localhost/api';

export const TOKEN_KEY: string = 'radiofind_token';

export interface ITestUser {
  name: string;
  surname: string;
  email: string;
  password: string;
  dateOfBirth: string;
  token: string;
}

export const uniqueEmail = (prefix: string = 'e2e'): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@example.com`;

export const registerUser = async (
  overrides: Partial<Omit<ITestUser, 'token'>> = {},
): Promise<ITestUser> => {
  const context: APIRequestContext = await request.newContext();

  const user: Omit<ITestUser, 'token'> = {
    name: 'Ada',
    surname: 'Lovelace',
    email: uniqueEmail(),
    password: 'Passw0rd!',
    dateOfBirth: '1994-03-07',
    ...overrides,
  };

  const response = await context.post(`${API_URL}/auth/register`, {
    data: {
      name: user.name,
      surname: user.surname,
      email: user.email,
      recoveryEmail: null,
      dateOfBirth: user.dateOfBirth,
      password: user.password,
      artistInformation: { typeOfArtist: 'ARTIST', artistName: null, description: null },
    },
  });

  expect(response.status(), `registration failed for ${user.email}`).toBe(200);

  const body = (await response.json()) as { token: string | null };

  await context.dispose();

  if (body.token === null) {
    throw new Error(`registration returned no token for ${user.email}`);
  }

  return { ...user, token: body.token };
};
