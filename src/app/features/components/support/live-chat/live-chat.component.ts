import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ChatAuthorEnum } from '../../../../core/enums/chat-author.enum';
import { Constants } from '../../../../core/constants/constants';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { ClockTimePipe } from '../../../../shared/pipes/clock-time/clock-time.pipe';
import { LiveChatService } from '../../../services/live-chat-service/live-chat.service';
import { LIVE_CHAT_MESSAGE_MAX_LENGTH } from '../../../constants/support.constant';

import type { ElementRef, OutputEmitterRef, Signal, WritableSignal } from '@angular/core';
import type { ChatMessage } from '../../../models/support.model';

@Component({
  selector: 'app-live-chat',
  templateUrl: './live-chat.component.html',
  styleUrl: './live-chat.component.scss',
  imports: [TranslatePipe, ClockTimePipe],
})
export class LiveChatComponent {
  private readonly liveChatService: LiveChatService = inject(LiveChatService);

  private readonly messageList: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('messageList');

  private readonly messageInput: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required<ElementRef<HTMLInputElement>>('messageInput');

  public readonly closed: OutputEmitterRef<void> = output();

  protected readonly messages: Signal<readonly ChatMessage[]> = this.liveChatService.messages;

  protected readonly draft: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  protected readonly isSendDisabled: Signal<boolean> = computed<boolean>(
    () => !this.draft().trim(),
  );

  protected readonly teamAuthor: ChatAuthorEnum.TEAM = ChatAuthorEnum.TEAM;

  protected readonly maxLength: number = LIVE_CHAT_MESSAGE_MAX_LENGTH;

  public constructor() {
    afterNextRender(() => {
      this.messageInput().nativeElement.focus();
    });

    afterRenderEffect(() => {
      const list: HTMLElement = this.messageList().nativeElement;

      if (this.messages().length) {
        list.scrollTop = list.scrollHeight;
      }
    });
  }

  public onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  public onSend(event: Event): void {
    event.preventDefault();

    if (this.isSendDisabled()) {
      return;
    }

    this.liveChatService.send(this.draft());
    this.draft.set(Constants.EMPTY_STRING);
  }

  public onClose(): void {
    this.closed.emit();
  }
}
