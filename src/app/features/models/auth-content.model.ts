import type { TranslationKey } from '../../core/types/translation.type';

export interface IAuthContent {
  title: TranslationKey;
  titleColor: TranslationKey;
  smile?: string;
  instructions: TranslationKey;
  content: IContentEntity[];
}

export interface IContentEntity {
  id: string;
  iconClass: string;
  contentTitle: TranslationKey;
  overview: TranslationKey;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IRegisterData {
  name: string;
  surname: string;
  email: string;
  recoveryEmail?: string | null;
  dateOfBirth: string;
  password: string;
  artistInformation?: IArtistInformation;
}

export interface IArtistInformation {
  typeOfArtist?: string;
  artistName?: string | null;
  description?: string | null;
}
