import type { TrackStatus } from '../types/track-status.type';

export interface ITrackEndpoints {
  tracks: string;
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
  coverUrl: string | null;
  createdAt: string;
}

export interface ITrackSummary {
  id: number;
  title: string;
  artistName: string;
  coverUrl: string | null;
  status: TrackStatus;
}
