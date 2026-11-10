export interface IEditTrackForm {
  title: string;
  genres: string[];
  description: string;
  cover: File | null;
  removeCover: boolean;
}
