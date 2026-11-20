import type { ChatAuthorEnum } from '../../core/enums/chat-author.enum';
import type { FaqCategoryEnum } from '../../core/enums/faq-category.enum';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IFaqItem {
  id: string;
  category: FaqCategoryEnum;
  question: TranslationKey;
  answer: TranslationKey;
}

export interface ISupportTopic {
  id: string;
  label: TranslationKey;
  iconClass: string;
  category: FaqCategoryEnum | null;
}

export interface IFaqCategoryTab {
  category: FaqCategoryEnum | null;
  label: TranslationKey;
}

export interface ISupportMessageDialogData {
  email: string;
  draft: ISupportMessageForm | null;
}

export interface ISupportMessageForm {
  subject: string;
  message: string;
}

export interface IUserChatMessage {
  id: number;
  author: ChatAuthorEnum.USER;
  text: string;
  sentAt: Date;
}

export interface ITeamChatMessage {
  id: number;
  author: ChatAuthorEnum.TEAM;
  textKey: TranslationKey;
  sentAt: Date;
}

export type ChatMessage = IUserChatMessage | ITeamChatMessage;
