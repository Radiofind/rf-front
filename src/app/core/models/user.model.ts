import type { ArtistTypeRequest } from '../types/artist-type-request.type';

export interface IUserEndpoints {
  users: string;
  me: string;
  profile: string;
  avatar: string;
}

export interface ICurrentUser {
  name: string;
  surname: string;
  email: string;
}

export interface IUserProfileData {
  name: string;
  surname: string;
  dateOfBirth: string;
  artistType: ArtistTypeRequest | null;
  artistName: string | null;
  description: string | null;
  registeredAt: string;
  avatarUrl: string | null;
}

export interface IAvatarResponse {
  avatarUrl: string;
}
