export interface ITrackDialogData {
  trackId: number;
}

export interface ITrackDetailsDialogData extends ITrackDialogData {
  isEditing: boolean;
  isLibrary: boolean;
}

export interface ITrackReportDialogData extends ITrackDialogData {
  title: string;
  artistName: string;
}
