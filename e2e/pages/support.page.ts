import type { Locator, Page } from '@playwright/test';

export class SupportPage {
  public readonly root: Locator;
  public readonly title: Locator;
  public readonly topics: Locator;
  public readonly questions: Locator;
  public readonly answer: Locator;
  public readonly viewAll: Locator;
  public readonly sendMessage: Locator;
  public readonly liveChat: Locator;
  public readonly discord: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-support-page');
    this.title = this.root.getByRole('heading', { level: 1 });
    this.topics = this.root.locator('.support__topic');
    this.questions = this.root.locator('.faq__question');
    this.answer = this.root.locator('.faq__answer');
    this.viewAll = this.root.getByRole('link', { name: 'View all' });
    this.sendMessage = this.root.getByRole('button', { name: 'Send a Message' });
    this.liveChat = this.root.locator('.support__channel', { hasText: 'Live Chat' });
    this.discord = this.root.locator('.support__channel', { hasText: 'Join Discord' });
  }

  public topic(label: string): Locator {
    return this.topics.filter({ hasText: label });
  }
}

export class FaqPage {
  public readonly root: Locator;
  public readonly title: Locator;
  public readonly groupTitles: Locator;
  public readonly questions: Locator;
  public readonly activeTab: Locator;
  public readonly search: Locator;
  public readonly empty: Locator;
  public readonly back: Locator;
  public readonly sendMessage: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-faq-page');
    this.title = this.root.getByRole('heading', { level: 1 });
    this.groupTitles = this.root.locator('.faq-page__group-title');
    this.questions = this.root.locator('.faq__question');
    this.activeTab = this.root.locator('.faq-page__tab--active');
    this.search = this.root.getByRole('searchbox', { name: 'Search questions' });
    this.empty = this.root.locator('.faq-page__empty');
    this.back = this.root.getByRole('link', { name: 'Back to Support' });
    this.sendMessage = this.root.getByRole('button', { name: 'Send a Message' });
  }

  public tab(label: string): Locator {
    return this.root.locator('.faq-page__tab', { hasText: label });
  }
}

export class SupportMessageModal {
  public readonly root: Locator;
  public readonly note: Locator;
  public readonly subject: Locator;
  public readonly message: Locator;
  public readonly send: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-support-message-modal');
    this.note = this.root.locator('.track-dialog__note');
    this.subject = this.root.locator('input');
    this.message = this.root.locator('textarea');
    this.send = this.root.getByRole('button', { name: 'Send Message' });
  }
}

export class LiveChat {
  public readonly root: Locator;
  public readonly status: Locator;
  public readonly bubbles: Locator;
  public readonly input: Locator;
  public readonly send: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-live-chat');
    this.status = this.root.locator('.chat__status');
    this.bubbles = this.root.locator('.chat__bubble');
    this.input = this.root.getByRole('textbox', { name: 'Your message' });
    this.send = this.root.getByRole('button', { name: 'Send message' });
  }
}
