import { ArtistType } from '../../core/types/artist-type.type';

export interface ILoginForm {
  email: string;
  password: string;
}

export interface IRegisterForm {
  name: string;
  surname: string;
  email: string;
  recoveryEmail: string;
  dateOfBirth: Date | null;
  password: string;
  confirmPassword: string;
  addInformation: boolean;
  typeOfArtist: ArtistType;
  artistOrBandName: string;
  description: string;
}
