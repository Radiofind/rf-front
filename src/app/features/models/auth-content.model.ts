export interface IAuthContent {
  title: string;
  titleColor: string;
  smile?: string;
  instructions: string;
  content: IContentEntity[];
}

export interface IContentEntity {
  id: string;
  iconClass: string;
  contentTitle: string;
  overview: string;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IRegisterData {
  name: string;
  surname: string;
  email: string;
  recoveryEmail?: string | null;
  dateOfBirth: string;
  password: string;
  artistInformation?: IArtistInformation;
}

export interface IArtistInformation {
  typeOfArtist?: string;
  artistName?: string | null;
  description?: string | null;
}
