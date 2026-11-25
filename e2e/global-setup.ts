import { BASE_URL } from './fixtures/base-url';

const APP_TITLE: string = '<title>RADIOFIND';

export default async function globalSetup(): Promise<void> {
  const html: string = await (await fetch(BASE_URL)).text();

  if (!html.includes(APP_TITLE)) {
    throw new Error(
      `${BASE_URL} does not serve Radiofind. Another dev server is probably listening on that ` +
        'port: stop it, or start Radiofind elsewhere and point E2E_BASE_URL at it.',
    );
  }
}
