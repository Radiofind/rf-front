import { expect } from '@playwright/test';

import type { APIRequestContext } from '@playwright/test';

export const MAILPIT_URL: string = process.env['E2E_MAILPIT_URL'] ?? 'http://localhost:8025';

interface IMailpitMessage {
  ID: string;
  Created: string;
}

const CODE_PATTERN: RegExp = /^\s*(\d{6})\s*$/m;

export const latestCode = async (
  request: APIRequestContext,
  address: string,
  sentAfter: Date,
): Promise<string> => {
  let messageId: string | undefined;

  await expect
    .poll(
      async () => {
        const response = await request.get(`${MAILPIT_URL}/api/v1/search`, {
          params: { query: `to:"${address}"` },
        });
        const { messages } = (await response.json()) as { messages: IMailpitMessage[] };
        messageId = messages.find(
          (message: IMailpitMessage) => new Date(message.Created) >= sentAfter,
        )?.ID;
        return messageId;
      },
      { message: `no code was mailed to ${address}`, timeout: 15_000 },
    )
    .toBeDefined();

  const message = await request.get(`${MAILPIT_URL}/api/v1/message/${String(messageId)}`);
  const { Text } = (await message.json()) as { Text: string };
  const code: string | undefined = CODE_PATTERN.exec(Text)?.[1];

  if (!code) {
    throw new Error(`the mail to ${address} contains no code`);
  }

  return code;
};
