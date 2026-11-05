import type { ISocialLinkConfig, SocialLinksForm } from '../models/edit-profile-form.model';

export const SOCIAL_LINKS: readonly ISocialLinkConfig[] = [
  {
    key: 'telegram',
    label: 'Telegram',
    iconClass: 'bxl bx-telegram',
    placeholderExample: 'https://t.me/yourname',
    domains: ['t.me', 'telegram.me', 'telegram.dog'],
  },
  {
    key: 'instagram',
    label: 'Instagram',
    iconClass: 'bxl bx-instagram',
    placeholderExample: 'https://instagram.com/yourname',
    domains: ['instagram.com', 'instagr.am'],
  },
  {
    key: 'youtube',
    label: 'YouTube',
    iconClass: 'bxl bx-youtube',
    placeholderExample: 'https://youtube.com/@yourname',
    domains: ['youtube.com', 'youtu.be'],
  },
  {
    key: 'facebook',
    label: 'Facebook',
    iconClass: 'bxl bx-facebook-circle',
    placeholderExample: 'https://facebook.com/yourname',
    domains: ['facebook.com', 'fb.com', 'fb.me'],
  },
  {
    key: 'spotify',
    label: 'Spotify',
    iconClass: 'bxl bx-spotify',
    placeholderExample: 'https://open.spotify.com/artist/yourid',
    domains: ['spotify.com', 'spotify.link'],
  },
  {
    key: 'appleMusic',
    label: 'Apple Music',
    iconClass: 'bxl bx-apple-music',
    placeholderExample: 'https://music.apple.com/artist/yourname',
    domains: ['music.apple.com'],
  },
  {
    key: 'soundcloud',
    label: 'SoundCloud',
    iconClass: 'bxl bx-soundcloud',
    placeholderExample: 'https://soundcloud.com/yourname',
    domains: ['soundcloud.com', 'snd.sc'],
  },
  {
    key: 'bandcamp',
    label: 'Bandcamp',
    iconClass: 'bx bx-disc',
    placeholderExample: 'https://yourname.bandcamp.com',
    domains: ['bandcamp.com'],
  },
  {
    key: 'icloud',
    label: 'iCloud',
    iconClass: 'bx bx-cloud',
    placeholderExample: 'https://icloud.com/yourname',
    domains: ['icloud.com'],
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    iconClass: 'bxl bx-tiktok',
    placeholderExample: 'https://tiktok.com/@yourname',
    domains: ['tiktok.com'],
  },
];

export const EMPTY_SOCIAL_LINKS_FORM: Readonly<SocialLinksForm> = {
  telegram: '',
  instagram: '',
  youtube: '',
  facebook: '',
  spotify: '',
  appleMusic: '',
  soundcloud: '',
  bandcamp: '',
  icloud: '',
  tiktok: '',
};
