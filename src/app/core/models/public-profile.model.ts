import type { ArtistTypeRequest } from '../types/artist-type-request.type';
import type { ProfileAccess } from '../types/profile-access.type';
import type { ISocialLinksData } from './user.model';

export interface IPublicProfileDetails {
  artistType: ArtistTypeRequest;
  mainGenres: string[];
  additionalGenres: string[];
  shortDescription: string | null;
  description: string | null;
  socialLinks: ISocialLinksData | null;
  followersCount: number;
  tracksCount: number;
  likesCount: number;
  joinedAt: string;
}

export interface IPublicProfile {
  publicId: string;
  displayName: string;
  avatarUrl: string | null;
  access: ProfileAccess;
  own: boolean;
  following: boolean;
  canFollow: boolean;
  details: IPublicProfileDetails | null;
}
