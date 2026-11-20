import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LiveChatService } from './live-chat.service';
import { ChatAuthorEnum } from '../../../core/enums/chat-author.enum';

describe('LiveChatService', () => {
  it('opens the conversation with a greeting from the team', () => {
    const service: LiveChatService = TestBed.inject(LiveChatService);

    expect(service.messages()).toEqual([
      expect.objectContaining({ author: ChatAuthorEnum.TEAM, textKey: 'support.chat.greeting' }),
    ]);
  });

  it('answers the first message with the offline notice', () => {
    const service: LiveChatService = TestBed.inject(LiveChatService);

    service.send('  Is anybody there?  ');

    expect(service.messages().slice(1)).toEqual([
      expect.objectContaining({ author: ChatAuthorEnum.USER, text: 'Is anybody there?' }),
      expect.objectContaining({
        author: ChatAuthorEnum.TEAM,
        textKey: 'support.chat.offlineReply',
      }),
    ]);
  });

  it('gives the offline notice only once', () => {
    const service: LiveChatService = TestBed.inject(LiveChatService);

    service.send('Hello');
    service.send('Hello again');

    expect(service.messages().at(-1)).toEqual(
      expect.objectContaining({ author: ChatAuthorEnum.USER, text: 'Hello again' }),
    );
    expect(service.messages()).toHaveLength(4);
  });

  it('ignores a blank message', () => {
    const service: LiveChatService = TestBed.inject(LiveChatService);

    service.send('   ');

    expect(service.messages()).toHaveLength(1);
  });
});
