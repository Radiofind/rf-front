import type { ArtistTypeRequest } from '../types/artist-type-request.type';

export interface IUserEndpoints {
  users: string;
  me: string;
  profile: string;
  avatar: string;
  settings: string;
  general: string;
}

export interface ICurrentUser {
  name: string;
  surname: string;
  email: string;
  avatarUrl: string | null;
}

export interface IUserProfileData {
  name: string;
  surname: string;
  email: string;
  recoveryEmail: string | null;
  dateOfBirth: string;
  artistType: ArtistTypeRequest | null;
  artistName: string | null;
  description: string | null;
  shortDescription: string | null;
  socialLinks: ISocialLinksData | null;
  mainGenres: string[];
  additionalGenres: string[];
  registeredAt: string;
  avatarUrl: string | null;
}

export interface IUpdateProfileData {
  name: string;
  surname: string;
  email: string;
  recoveryEmail: string | null;
  artistType: ArtistTypeRequest | null;
  artistName: string | null;
  description: string | null;
  shortDescription: string | null;
  socialLinks: ISocialLinksData | null;
  mainGenres: string[];
  additionalGenres: string[];
}

export interface ISocialLinksData {
  telegram: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  spotify: string | null;
  appleMusic: string | null;
  soundcloud: string | null;
  bandcamp: string | null;
  icloud: string | null;
  tiktok: string | null;
}

export interface IUpdatedProfileData {
  profile: IUserProfileData;
  emailChanged: boolean;
  requiresReauthentication: boolean;
}

export interface IAvatarResponse {
  avatarUrl: string;
}
