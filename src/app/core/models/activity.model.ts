import type { ActivityType } from '../types/activity-type.type';
import type { ITrackSummary } from './track.model';

export interface IActivity {
  id: number;
  type: ActivityType;
  createdAt: string;
  track: ITrackSummary | null;
}
