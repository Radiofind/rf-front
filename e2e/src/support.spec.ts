import { expect, test } from '../fixtures/test';
import { API_URL } from '../fixtures/api';
import { bearer } from '../fixtures/tracks';
import { FaqPage, LiveChat, SupportMessageModal, SupportPage } from '../pages/support.page';
import { SidebarPage } from '../pages/sidebar.page';

import type { APIResponse, Request } from '@playwright/test';

const SUPPORT_MESSAGES_URL: string = `${API_URL}/support/messages`;

test.describe('support', () => {
  test.describe('POST /support/messages', () => {
    test('requires sign-in', async ({ request }) => {
      const response: APIResponse = await request.post(SUPPORT_MESSAGES_URL, {
        data: { subject: 'Upload stuck', message: 'My track stays in review' },
      });

      expect(response.status()).toBe(401);
    });

    test('rejects a message without subject', async ({ request, user }) => {
      const response: APIResponse = await request.post(SUPPORT_MESSAGES_URL, {
        headers: bearer(user.token),
        data: { subject: ' ', message: 'My track stays in review' },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects a message over 2000 characters', async ({ request, user }) => {
      const response: APIResponse = await request.post(SUPPORT_MESSAGES_URL, {
        headers: bearer(user.token),
        data: { subject: 'Upload stuck', message: 'a'.repeat(2001) },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('POST /support/contact-messages', () => {
    test('is open to visitors of the website but validates the email', async ({ request }) => {
      const response: APIResponse = await request.post(`${API_URL}/support/contact-messages`, {
        data: {
          name: 'Grace',
          email: 'grace',
          subject: 'Pricing',
          message: 'Is there a yearly plan?',
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('support page', () => {
    test('is reached from the sidebar', async ({ authenticatedPage }) => {
      const sidebar: SidebarPage = new SidebarPage(authenticatedPage);
      const support: SupportPage = new SupportPage(authenticatedPage);

      await authenticatedPage.goto('/media-library');
      await sidebar.item('Support').click();

      await expect(authenticatedPage).toHaveURL(/\/support$/);
      await expect(support.title).toHaveText('Support');
    });

    test('shows the help topics and the most common questions', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);

      await authenticatedPage.goto('/support');

      await expect(support.topics).toHaveText([
        'FAQ',
        'Playback Issues',
        'Uploading Music',
        'Premium Account',
        'Other Issues',
      ]);
      await expect(support.questions).toHaveText([
        'How do I upload my music?',
        'Why is my music not playing?',
        'How to get Premium?',
        'Can I download music offline?',
        'How to contact support?',
      ]);
    });

    test('answers a question on click', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);

      await authenticatedPage.goto('/support');
      await support.questions.filter({ hasText: 'Why is my music not playing?' }).click();

      await expect(support.answer).toContainText('Radio-mode');
    });

    test('opens the questions of a topic', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const faq: FaqPage = new FaqPage(authenticatedPage);

      await authenticatedPage.goto('/support');
      await support.topic('Uploading Music').click();

      await expect(authenticatedPage).toHaveURL(/\/support\/faq\?category=uploading$/);
      await expect(faq.activeTab).toHaveText('Uploading');
      await expect(faq.groupTitles).toHaveText(['Uploading']);
    });

    test('lists every question behind "View all"', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const faq: FaqPage = new FaqPage(authenticatedPage);

      await authenticatedPage.goto('/support');
      await support.viewAll.click();

      await expect(faq.title).toHaveText('Help Center');
      await expect(faq.groupTitles).toHaveText([
        'Playback',
        'Uploading',
        'Premium',
        'Account & other',
      ]);
      await expect(faq.questions).toHaveCount(21);
    });

    test('offers Discord only as coming soon', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);

      await authenticatedPage.goto('/support');

      await expect(support.discord).toBeDisabled();
      await expect(support.discord).toContainText('Coming soon');
    });
  });

  test.describe('help center', () => {
    test('switches topics through the tabs', async ({ authenticatedPage }) => {
      const faq: FaqPage = new FaqPage(authenticatedPage);

      await authenticatedPage.goto('/support/faq');
      await faq.tab('Premium').click();

      await expect(authenticatedPage).toHaveURL(/\/support\/faq\?category=premium$/);
      await expect(faq.questions).toHaveText(['How to get Premium?', 'What does Premium include?']);
    });

    test('finds questions by the words of their answers', async ({ authenticatedPage }) => {
      const faq: FaqPage = new FaqPage(authenticatedPage);

      await authenticatedPage.goto('/support/faq');
      await faq.search.fill('backup codes');

      await expect(faq.questions).toHaveText(['What are backup codes?']);
    });

    test('says when nothing matches the search', async ({ authenticatedPage }) => {
      const faq: FaqPage = new FaqPage(authenticatedPage);

      await authenticatedPage.goto('/support/faq');
      await faq.search.fill('karaoke');

      await expect(faq.empty).toContainText('No answers for "karaoke"');
      await expect(faq.questions).toHaveCount(0);
    });

    test('leads back to the support page', async ({ authenticatedPage }) => {
      const faq: FaqPage = new FaqPage(authenticatedPage);

      await authenticatedPage.goto('/support/faq');
      await faq.back.click();

      await expect(authenticatedPage).toHaveURL(/\/support$/);
    });
  });

  test.describe('send a message', () => {
    test('sends subject and message on behalf of the account', async ({
      authenticatedPage,
      user,
    }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const modal: SupportMessageModal = new SupportMessageModal(authenticatedPage);
      await authenticatedPage.route('**/api/support/messages', (route) =>
        route.fulfill({ status: 204 }),
      );

      await authenticatedPage.goto('/support');
      await support.sendMessage.click();
      await expect(modal.note).toContainText(`Our team will reply to ${user.email}.`);
      await modal.subject.fill('Upload stuck');
      await modal.message.fill('My track stays in review');
      const sent: Promise<Request> = authenticatedPage.waitForRequest('**/api/support/messages');
      await modal.send.click();

      expect((await sent).postDataJSON()).toEqual({
        subject: 'Upload stuck',
        message: 'My track stays in review',
      });
      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText(
        'Your message has been sent. We will answer you by email.',
      );
    });

    test('closes the form before the answer arrives', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const modal: SupportMessageModal = new SupportMessageModal(authenticatedPage);
      let answer: () => void = () => undefined;
      const answered: Promise<void> = new Promise<void>((resolve) => {
        answer = resolve;
      });
      await authenticatedPage.route('**/api/support/messages', async (route) => {
        await answered;
        await route.fulfill({ status: 204 });
      });

      await authenticatedPage.goto('/support');
      await support.sendMessage.click();
      await modal.subject.fill('Upload stuck');
      await modal.message.fill('My track stays in review');
      await modal.send.click();

      await expect(modal.root).toBeHidden();
      answer();
      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText(
        'Your message has been sent. We will answer you by email.',
      );
    });

    test('cannot be sent without a message', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const modal: SupportMessageModal = new SupportMessageModal(authenticatedPage);

      await authenticatedPage.goto('/support');
      await support.sendMessage.click();
      await modal.subject.fill('Upload stuck');

      await expect(modal.send).toBeDisabled();
    });

    test('asks to wait after too many messages', async ({ authenticatedPage }) => {
      const faq: FaqPage = new FaqPage(authenticatedPage);
      const modal: SupportMessageModal = new SupportMessageModal(authenticatedPage);
      await authenticatedPage.route('**/api/support/messages', (route) =>
        route.fulfill({ status: 429, body: '' }),
      );

      await authenticatedPage.goto('/support/faq');
      await faq.sendMessage.click();
      await modal.subject.fill('Upload stuck');
      await modal.message.fill('My track stays in review');
      await modal.send.click();

      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText(
        'You have sent too many messages. Please try again in an hour.',
      );
      await expect(modal.root).toBeHidden();
    });

    test('keeps a message that could not be sent for the next try', async ({
      authenticatedPage,
    }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const modal: SupportMessageModal = new SupportMessageModal(authenticatedPage);
      await authenticatedPage.route('**/api/support/messages', (route) =>
        route.fulfill({ status: 503, body: '' }),
      );

      await authenticatedPage.goto('/support');
      await support.sendMessage.click();
      await modal.subject.fill('Upload stuck');
      await modal.message.fill('My track stays in review');
      await modal.send.click();
      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText(
        'Your message could not be sent. Please try again later.',
      );
      await support.sendMessage.click();

      await expect(modal.subject).toHaveValue('Upload stuck');
      await expect(modal.message).toHaveValue('My track stays in review');
    });
  });

  test.describe('live chat', () => {
    test('tells that nobody is online yet', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const chat: LiveChat = new LiveChat(authenticatedPage);

      await authenticatedPage.goto('/support');
      await support.liveChat.click();
      await expect(chat.status).toHaveText('Offline');
      await chat.input.fill('Is anybody there?');
      await chat.send.click();

      await expect(chat.bubbles).toHaveText([
        'Hi! This is the RADIOFIND support chat.',
        'Is anybody there?',
        /Live chat is not staffed yet/,
      ]);
      await expect(chat.input).toHaveValue('');
    });

    test('closes on Escape', async ({ authenticatedPage }) => {
      const support: SupportPage = new SupportPage(authenticatedPage);
      const chat: LiveChat = new LiveChat(authenticatedPage);

      await authenticatedPage.goto('/support');
      await support.liveChat.click();
      await expect(chat.input).toBeFocused();
      await authenticatedPage.keyboard.press('Escape');

      await expect(chat.root).toBeHidden();
    });
  });
});
