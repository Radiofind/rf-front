import type { ArtistType } from '../../core/types/artist-type.type';
import type { ISocialLinksData } from '../../core/models/user.model';

export type SocialLinkKey = keyof ISocialLinksData;

export type SocialLinksForm = Record<SocialLinkKey, string>;

export interface IEditProfileForm {
  name: string;
  surname: string;
  email: string;
  recoveryEmail: string;
  artistType: ArtistType;
  artistName: string;
  shortDescription: string;
  description: string;
  mainGenres: string[];
  additionalGenres: string[];
  socialLinks: SocialLinksForm;
}

export interface ISocialLinkConfig {
  key: SocialLinkKey;
  label: string;
  iconClass: string;
  placeholder: string;
  domains: readonly string[];
}

export interface ISocialLinkItem {
  key: SocialLinkKey;
  label: string;
  iconClass: string;
  url: string;
}
