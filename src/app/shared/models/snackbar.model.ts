import type { SnackbarType } from '../../core/types/snackbar-type.type';

export interface ISnackbarOptions {
  type?: SnackbarType;
  iconClass?: string | null;
  duration?: number;
}

export interface ISnackbarMessage {
  id: number;
  content: string;
  type: SnackbarType;
  iconClass: string | null;
}
