import type { OwnTracksSortEnum } from '../enums/own-tracks-sort.enum';
import type { SortDirectionEnum } from '../enums/sort-direction.enum';
import type { TrackStatus } from '../types/track-status.type';

export interface ITrackEndpoints {
  tracks: string;
  plays: string;
  like: string;
  cancelSubmission: string;
  submit: string;
  statistics: string;
  schedule: string;
  scheduleChangeRequests: string;
  rejection: string;
}

export interface IEditTrackData {
  title: string;
  genres: string[];
  description: string | null;
  cover: File | null;
  removeCover: boolean;
}

export interface ITrackDetails {
  id: number;
  title: string;
  artistName: string;
  uploadedBy: string;
  genres: string[];
  description: string | null;
  status: TrackStatus;
  durationSeconds: number | null;
  audioFormat: string;
  audioSizeBytes: number;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITrackStatistics {
  playsCount: number;
  likesCount: number;
  uniqueListeners: number;
  radioAirings: number;
  listenersLast7Days: number;
  listenersLast30Days: number;
  lastListenedAt: string | null;
}

export interface IPendingScheduleChange {
  preferredAt: string;
  comment: string | null;
  requestedAt: string;
}

export interface IPlaybackSchedule {
  airsAt: string;
  durationSeconds: number | null;
  pendingChange: IPendingScheduleChange | null;
}

export interface IScheduleChangeData {
  preferredAt: string;
  comment: string | null;
}

export interface IRejectionReason {
  summary: string;
  details: string;
  reviewer: string;
  reviewedAt: string;
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
