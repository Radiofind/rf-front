import { ArtistType } from "../../core/types/artist-type.type";
import { IAuthContent } from "../models/auth-content.model";

export const AUTH_DESCRIPTION_CONTENT_LOGIN: IAuthContent = {
  title: 'Welcome Back ',
  titleColor: 'Artist',
  smile: ' 👋',
  instructions: 'Log in to your account and continue sharing your music with the world.',
  content: [
    {
      id: '1',
      iconClass: 'bx bx-equalizer',
      contentTitle: 'Your Music, Worldwide',
      overview: 'Upload, get reviewed and reach thousands of listeners.',
    },
    {
      id: '2',
      iconClass: 'bx bx-trending-up',
      contentTitle: 'Track Your Progress',
      overview: 'See stats, plays, listeners and your music performance.',
    },
    {
      id: '3',
      iconClass: 'bx bx-check-shield',
      contentTitle: 'Secure & Private',
      overview: 'Your data and your music are always protected.',
    },
  ],
};

export const AUTH_DESCRIPTION_CONTENT_REGISTER: IAuthContent = {
  title: 'Join RADIOFIND ',
  titleColor: 'Start Your Journey',
  instructions: 'Create your account and share your music with the world.',
  content: [
    {
      id: '1',
      iconClass: 'bx bx-music',
      contentTitle: 'Get Heard',
      overview: 'Upload your tracks and reach real listeners.',
    },
    {
      id: '2',
      iconClass: 'bx bx-trending-up',
      contentTitle: 'Track Your Stats',
      overview: 'See your plays, listeners and performance in real time.',
    },
    {
      id: '3',
      iconClass: 'bx bx-check-shield',
      contentTitle: 'Secure & Private',
      overview: 'Your data and your music are always protected.',
    },
  ],
};

export const ARTIST_TYPES: ArtistType[] = ['Artist', 'Band']; 
