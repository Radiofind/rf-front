import type { OwnTracksSortEnum } from '../enums/own-tracks-sort.enum';
import type { SortDirectionEnum } from '../enums/sort-direction.enum';
import type { TrackStatus } from '../types/track-status.type';

export interface ITrackEndpoints {
  tracks: string;
  plays: string;
  like: string;
}

export interface IUploadTrackData {
  title: string;
  genres: string[];
  description: string | null;
  audio: File;
  cover: File | null;
}

export interface ITrack {
  id: number;
  title: string;
  artistName: string;
  genres: string[];
  description: string | null;
  status: TrackStatus;
  audioFormat: string;
  audioSizeBytes: number;
  durationSeconds: number | null;
  coverUrl: string | null;
  audioUrl: string | null;
  playsCount: number;
  likesCount: number;
  liked: boolean;
  createdAt: string;
}

export interface IOwnTracksQuery {
  status: TrackStatus | null;
  search: string;
  sort: OwnTracksSortEnum;
  direction: SortDirectionEnum;
  page: number;
  size: number;
}

export interface ITrackSummary {
  id: number;
  title: string;
  artistName: string;
  coverUrl: string | null;
  status: TrackStatus;
}
