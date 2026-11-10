export interface IPlayerTrack {
  id: number;
  title: string;
  artistName: string;
  coverUrl: string | null;
  audioUrl: string;
  liked: boolean;
  canLike: boolean;
}

export interface IPlayback {
  track: IPlayerTrack | null;
  playbackId: number;
  isPlaying: boolean;
}
