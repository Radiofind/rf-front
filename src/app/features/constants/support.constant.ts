import { FaqCategoryEnum } from '../../core/enums/faq-category.enum';

import type { EN_TRANSLATIONS } from '../../core/i18n/translations/en.translations';
import type { TranslationKey } from '../../core/types/translation.type';
import type { IFaqCategoryTab, IFaqItem, ISupportTopic } from '../models/support.model';

type FaqQuestionId = keyof typeof EN_TRANSLATIONS.support.questions;

const faqItem = (id: FaqQuestionId, category: FaqCategoryEnum): IFaqItem => ({
  id: id,
  category: category,
  question: `support.questions.${id}.question`,
  answer: `support.questions.${id}.answer`,
});

export const FAQ_ITEMS: readonly IFaqItem[] = [
  faqItem('uploadHow', FaqCategoryEnum.UPLOADING),
  faqItem('uploadAfter', FaqCategoryEnum.UPLOADING),
  faqItem('uploadRejected', FaqCategoryEnum.UPLOADING),
  faqItem('uploadEdit', FaqCategoryEnum.UPLOADING),
  faqItem('uploadDrafts', FaqCategoryEnum.UPLOADING),
  faqItem('uploadSchedule', FaqCategoryEnum.UPLOADING),
  faqItem('uploadOwnership', FaqCategoryEnum.UPLOADING),
  faqItem('playbackNotPlaying', FaqCategoryEnum.PLAYBACK),
  faqItem('playbackRadioMode', FaqCategoryEnum.PLAYBACK),
  faqItem('playbackDownload', FaqCategoryEnum.PLAYBACK),
  faqItem('playbackPlayCount', FaqCategoryEnum.PLAYBACK),
  faqItem('playbackReport', FaqCategoryEnum.PLAYBACK),
  faqItem('premiumHow', FaqCategoryEnum.PREMIUM),
  faqItem('premiumIncludes', FaqCategoryEnum.PREMIUM),
  faqItem('accountContact', FaqCategoryEnum.ACCOUNT),
  faqItem('accountTwoFactor', FaqCategoryEnum.ACCOUNT),
  faqItem('accountBackupCodes', FaqCategoryEnum.ACCOUNT),
  faqItem('accountPassword', FaqCategoryEnum.ACCOUNT),
  faqItem('accountVisibility', FaqCategoryEnum.ACCOUNT),
  faqItem('accountAppearance', FaqCategoryEnum.ACCOUNT),
  faqItem('accountDelete', FaqCategoryEnum.ACCOUNT),
];

export const FEATURED_FAQ_ITEMS: readonly IFaqItem[] = [
  faqItem('uploadHow', FaqCategoryEnum.UPLOADING),
  faqItem('playbackNotPlaying', FaqCategoryEnum.PLAYBACK),
  faqItem('premiumHow', FaqCategoryEnum.PREMIUM),
  faqItem('playbackDownload', FaqCategoryEnum.PLAYBACK),
  faqItem('accountContact', FaqCategoryEnum.ACCOUNT),
];

export const SUPPORT_TOPICS: readonly ISupportTopic[] = [
  { id: 'faq', label: 'support.topics.faq', iconClass: 'bx bx-book-open', category: null },
  {
    id: FaqCategoryEnum.PLAYBACK,
    label: 'support.topics.playback',
    iconClass: 'bx bx-play-circle',
    category: FaqCategoryEnum.PLAYBACK,
  },
  {
    id: FaqCategoryEnum.UPLOADING,
    label: 'support.topics.uploading',
    iconClass: 'bx bx-arrow-up-circle',
    category: FaqCategoryEnum.UPLOADING,
  },
  {
    id: FaqCategoryEnum.PREMIUM,
    label: 'support.topics.premium',
    iconClass: 'bx bx-credit-card',
    category: FaqCategoryEnum.PREMIUM,
  },
  {
    id: FaqCategoryEnum.ACCOUNT,
    label: 'support.topics.other',
    iconClass: 'bx bx-cog',
    category: FaqCategoryEnum.ACCOUNT,
  },
];

export const FAQ_CATEGORY_TABS: readonly IFaqCategoryTab[] = [
  { category: null, label: 'support.faq.all' },
  { category: FaqCategoryEnum.PLAYBACK, label: 'support.categories.playback' },
  { category: FaqCategoryEnum.UPLOADING, label: 'support.categories.uploading' },
  { category: FaqCategoryEnum.PREMIUM, label: 'support.categories.premium' },
  { category: FaqCategoryEnum.ACCOUNT, label: 'support.categories.account' },
];

export const SUPPORT_SUBJECT_MAX_LENGTH: number = 150;

export const SUPPORT_SUBJECT_MAX_LENGTH_MESSAGE: TranslationKey = 'validation.maxLengthTitle';

export const SUPPORT_MESSAGE_MAX_LENGTH: number = 2000;

export const SUPPORT_MESSAGE_MAX_LENGTH_MESSAGE: TranslationKey =
  'validation.maxLengthSupportMessage';

export const SUPPORT_MESSAGE_ROWS: number = 6;

export const LIVE_CHAT_MESSAGE_MAX_LENGTH: number = 1000;

export const SUPPORT_MESSAGES = {
  sent: 'messages.supportMessageSent',
  tooMany: 'messages.supportMessageTooMany',
  failed: 'messages.supportMessageFailed',
} as const satisfies Record<string, TranslationKey>;

export const LIVE_CHAT_GREETING: TranslationKey = 'support.chat.greeting';

export const LIVE_CHAT_OFFLINE_REPLY: TranslationKey = 'support.chat.offlineReply';
