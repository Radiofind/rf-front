import { describe, expect, it } from 'vitest';
import { socialLinkError } from './social-link.validator';
import { Constants } from '../../constants/constants';
import { ProfileValidationMessages } from '../../../features/constants/profile-error-messages.constant';
import { SOCIAL_LINKS } from '../../../features/constants/edit-profile.constant';

import type { ValidationError } from '@angular/forms/signals';
import type { ISocialLinkConfig } from '../../../features/models/edit-profile-form.model';

describe('socialLinkError', () => {
  const telegramDomains: readonly string[] = ['t.me', 'telegram.me'];

  const check = (link: string): ValidationError | undefined =>
    socialLinkError(link, 'Telegram', telegramDomains);

  it('accepts an empty link because every social link is optional', () => {
    expect(check('')).toBeUndefined();
  });

  it('accepts http and https links of the platform', () => {
    expect(check('https://t.me/radiofind')).toBeUndefined();
    expect(check('http://telegram.me/radiofind')).toBeUndefined();
  });

  it('accepts subdomains and ignores the host case', () => {
    expect(check('https://www.T.ME/radiofind')).toBeUndefined();
  });

  it('rejects a link of another platform', () => {
    expect(check('https://instagram.com/radiofind')).toEqual({
      kind: Constants.SOCIAL_LINK_PROPERTY,
      message: `${ProfileValidationMessages.WRONG_SOCIAL_LINK} Telegram`,
    });
  });

  it('rejects look-alike hosts that only end with the platform name', () => {
    expect(check('https://faket.me/radiofind')?.kind).toBe(Constants.SOCIAL_LINK_PROPERTY);
    expect(check('https://t.me.evil.com/radiofind')?.kind).toBe(Constants.SOCIAL_LINK_PROPERTY);
  });

  it.each(['not a url', 't.me/radiofind', 'ftp://t.me/radiofind', 'https://t.me/radio find'])(
    'rejects %s as a malformed link',
    (link: string) => {
      expect(check(link)).toEqual({
        kind: Constants.URL_PROPERTY,
        message: ProfileValidationMessages.INVALID_URL,
      });
    },
  );

  it('accepts the placeholder example of every configured platform', () => {
    SOCIAL_LINKS.forEach((link: ISocialLinkConfig) => {
      const example: string = link.placeholder.replace('e.g. ', '');

      expect(socialLinkError(example, link.label, link.domains)).toBeUndefined();
    });
  });

  it('does not accept a link of one configured platform for another one', () => {
    const telegram: ISocialLinkConfig = SOCIAL_LINKS.find((link) => link.key === 'telegram')!;
    const instagram: ISocialLinkConfig = SOCIAL_LINKS.find((link) => link.key === 'instagram')!;

    expect(
      socialLinkError('https://instagram.com/radiofind', telegram.label, telegram.domains)?.kind,
    ).toBe(Constants.SOCIAL_LINK_PROPERTY);
    expect(
      socialLinkError('https://t.me/radiofind', instagram.label, instagram.domains)?.kind,
    ).toBe(Constants.SOCIAL_LINK_PROPERTY);
  });
});
