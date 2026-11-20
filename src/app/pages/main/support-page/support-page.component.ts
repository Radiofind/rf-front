import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Links } from '../../../core/constants/links';
import { Constants } from '../../../core/constants/constants';
import { FaqAccordionComponent } from '../../../features/components/support/faq-accordion/faq-accordion.component';
import { LiveChatComponent } from '../../../features/components/support/live-chat/live-chat.component';
import { SupportContactService } from '../../../features/services/support-contact-service/support-contact.service';
import { FEATURED_FAQ_ITEMS, SUPPORT_TOPICS } from '../../../features/constants/support.constant';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';

import type { Params } from '@angular/router';
import type { WritableSignal } from '@angular/core';
import type { IFaqItem, ISupportTopic } from '../../../features/models/support.model';

@Component({
  selector: 'app-support-page',
  templateUrl: './support-page.component.html',
  styleUrl: './support-page.component.scss',
  imports: [RouterLink, FaqAccordionComponent, LiveChatComponent, ButtonComponent, TranslatePipe],
})
export class SupportPageComponent {
  private readonly supportContactService: SupportContactService = inject(SupportContactService);

  protected readonly topics: readonly ISupportTopic[] = SUPPORT_TOPICS;

  protected readonly featuredFaq: readonly IFaqItem[] = FEATURED_FAQ_ITEMS;

  protected readonly faqLink: string = `/${Links.SUPPORT_FAQ_URL}`;

  protected readonly isChatOpen: WritableSignal<boolean> = signal<boolean>(false);

  public topicQueryParams(topic: ISupportTopic): Params | null {
    return topic.category ? { [Constants.CATEGORY_QUERY_PARAM]: topic.category } : null;
  }

  public onSendMessage(): void {
    this.supportContactService.openMessageForm();
  }

  public onOpenChat(): void {
    this.isChatOpen.set(true);
  }

  public onCloseChat(): void {
    this.isChatOpen.set(false);
  }
}
