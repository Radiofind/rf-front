import { Constants } from '../../constants/constants';
import { ProfileValidationMessages } from '../../../features/constants/profile-error-messages.constant';

import type { ValidationError } from '@angular/forms/signals';

const parseUrl = (link: string): URL | null => {
  try {
    return new URL(link);
  } catch {
    return null;
  }
};

const isHostOf = (hostname: string, domain: string): boolean =>
  hostname === domain || hostname.endsWith(Constants.DOT + domain);

export const socialLinkError = (
  link: string,
  platform: string,
  domains: readonly string[],
): ValidationError | undefined => {
  if (!link) {
    return undefined;
  }

  const url: URL | null = Constants.SPACES_VALIDATOR_PATTERN.test(link) ? null : parseUrl(link);

  if (!url?.hostname || !Constants.ALLOWED_URL_PROTOCOLS.includes(url.protocol)) {
    return { kind: Constants.URL_PROPERTY, message: ProfileValidationMessages.INVALID_URL };
  }

  const hostname: string = url.hostname.toLowerCase();

  if (domains.some((domain: string) => isHostOf(hostname, domain))) {
    return undefined;
  }

  return {
    kind: Constants.SOCIAL_LINK_PROPERTY,
    message: `${ProfileValidationMessages.WRONG_SOCIAL_LINK} ${platform}`,
  };
};
