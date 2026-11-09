export interface IPlayerTrack {
  id: number;
  title: string;
  artistName: string;
  coverUrl: string | null;
  audioUrl: string;
}

export interface IPlayback {
  track: IPlayerTrack | null;
  playbackId: number;
  isPlaying: boolean;
}
