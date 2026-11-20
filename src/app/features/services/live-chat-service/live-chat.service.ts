import { computed, Service, signal } from '@angular/core';
import { ChatAuthorEnum } from '../../../core/enums/chat-author.enum';
import { Constants } from '../../../core/constants/constants';
import { LIVE_CHAT_GREETING, LIVE_CHAT_OFFLINE_REPLY } from '../../constants/support.constant';

import type { Signal, WritableSignal } from '@angular/core';
import type { ChatMessage } from '../../models/support.model';

@Service()
export class LiveChatService {
  private readonly messagesState: WritableSignal<readonly ChatMessage[]> = signal<
    readonly ChatMessage[]
  >([
    {
      id: Constants.ZERO,
      author: ChatAuthorEnum.TEAM,
      textKey: LIVE_CHAT_GREETING,
      sentAt: new Date(),
    },
  ]);

  public readonly messages: Signal<readonly ChatMessage[]> = this.messagesState.asReadonly();

  private readonly hasOfflineReply: Signal<boolean> = computed<boolean>(() =>
    this.messagesState().some(
      (message: ChatMessage) =>
        message.author === ChatAuthorEnum.TEAM && message.textKey === LIVE_CHAT_OFFLINE_REPLY,
    ),
  );

  public send(text: string): void {
    const trimmed: string = text.trim();

    if (!trimmed) {
      return;
    }

    const shouldReply: boolean = !this.hasOfflineReply();

    this.append({
      id: this.nextId(),
      author: ChatAuthorEnum.USER,
      text: trimmed,
      sentAt: new Date(),
    });

    if (shouldReply) {
      this.append({
        id: this.nextId(),
        author: ChatAuthorEnum.TEAM,
        textKey: LIVE_CHAT_OFFLINE_REPLY,
        sentAt: new Date(),
      });
    }
  }

  private append(message: ChatMessage): void {
    this.messagesState.update((messages: readonly ChatMessage[]) => [...messages, message]);
  }

  private nextId(): number {
    return this.messagesState().length;
  }
}
