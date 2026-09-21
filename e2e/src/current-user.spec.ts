import { expect, test } from '../fixtures/test';
import { API_URL } from '../fixtures/api';
import { SidebarPage } from '../pages/sidebar.page';

import type { Request, Response } from '@playwright/test';

const CURRENT_USER_URL: string = `${API_URL}/users/me`;

const isCurrentUserRequest = (request: Request): boolean =>
  request.url().startsWith(CURRENT_USER_URL) && request.method() === 'GET';

test.describe('current user', () => {
  test.describe('GET /users/me', () => {
    test('returns the signed-in user for a valid token', async ({ request, user }) => {
      const response: Response = await request.get(CURRENT_USER_URL, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      expect(response.status()).toBe(200);

      const body = (await response.json()) as Record<string, unknown>;

      expect(body).toMatchObject({
        name: user.name,
        surname: user.surname,
        email: user.email,
      });
    });

    test('never returns the password of the user', async ({ request, user }) => {
      const response: Response = await request.get(CURRENT_USER_URL, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const body = (await response.json()) as Record<string, unknown>;

      expect(Object.keys(body)).not.toContain('password');
    });

    test('rejects a request without a token', async ({ request }) => {
      const response: Response = await request.get(CURRENT_USER_URL);

      expect([401, 403]).toContain(response.status());
    });

    test('rejects a malformed token', async ({ request }) => {
      const response: Response = await request.get(CURRENT_USER_URL, {
        headers: { Authorization: 'Bearer not-a-jwt' },
      });

      expect([401, 403]).toContain(response.status());
    });

    test('rejects a token of the wrong scheme', async ({ request, user }) => {
      const response: Response = await request.get(CURRENT_USER_URL, {
        headers: { Authorization: user.token },
      });

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('in the application shell', () => {
    test('asks for the current user with the stored bearer token', async ({
      authenticatedPage,
      user,
    }) => {
      const currentUserRequest: Promise<Request> =
        authenticatedPage.waitForRequest(isCurrentUserRequest);

      await authenticatedPage.goto('/my-uploads');

      const request: Request = await currentUserRequest;

      expect(request.headers()['authorization']).toBe(`Bearer ${user.token}`);
      expect(request.postData()).toBeNull();

      const response: Response | null = await request.response();

      expect(response?.status()).toBe(200);
    });

    test('shows the full name and the email of the signed-in user', async ({
      authenticatedPage,
      user,
    }) => {
      const sidebar: SidebarPage = new SidebarPage(authenticatedPage);

      await authenticatedPage.goto('/my-uploads');

      await expect(sidebar.userName).toHaveText(`${user.name} ${user.surname}`);
      await expect(sidebar.userEmail).toHaveText(user.email);
    });

    test('keeps the user data while navigating between the pages', async ({
      authenticatedPage,
      user,
    }) => {
      const sidebar: SidebarPage = new SidebarPage(authenticatedPage);

      let requests: number = 0;

      authenticatedPage.on('request', (request: Request) => {
        if (isCurrentUserRequest(request)) {
          requests += 1;
        }
      });

      await authenticatedPage.goto('/my-uploads');
      await expect(sidebar.userName).toHaveText(`${user.name} ${user.surname}`);

      await sidebar.item('Statistics').click();
      await expect(authenticatedPage).toHaveURL(/\/statistics$/);

      await sidebar.item('Support').click();
      await expect(authenticatedPage).toHaveURL(/\/support$/);

      await expect(sidebar.userName).toHaveText(`${user.name} ${user.surname}`);
      await expect(sidebar.userEmail).toHaveText(user.email);
      expect(requests).toBe(1);
    });

    test('does not ask for the current user on the login page', async ({ page }) => {
      let requests: number = 0;

      page.on('request', (request: Request) => {
        if (isCurrentUserRequest(request)) {
          requests += 1;
        }
      });

      await page.goto('/auth/login');
      await expect(page.locator('h2.form-content__title')).toHaveText('Log In');

      expect(requests).toBe(0);
    });
  });
});
