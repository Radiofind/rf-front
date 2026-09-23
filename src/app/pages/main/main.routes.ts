import { Links } from '../../core/constants/links';

import type { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
  {
    path: Links.DEFAULT_PATH,
    redirectTo: Links.MEDIA_LIBRARY_URL,
    pathMatch: 'full',
  },
  {
    path: Links.MEDIA_LIBRARY_URL,
    loadComponent: () =>
      import('../media-library-page/media-library-page.component').then(
        (c) => c.MediaLibraryPageComponent,
      ),
  },
  {
    path: Links.UPLOAD_TRACK_URL,
    loadComponent: () =>
      import('../upload-track-page/upload-track-page.component').then(
        (c) => c.UploadTrackPageComponent,
      ),
  },
  {
    path: Links.MY_UPLOADS_URL,
    loadComponent: () =>
      import('../my-uploads-page/my-uploads-page.component').then((c) => c.MyUploadsPageComponent),
  },
  {
    path: Links.STATISTICS_URL,
    loadComponent: () =>
      import('../statistics-page/statistics-page.component').then((c) => c.StatisticsPageComponent),
  },
  {
    path: Links.SUPPORT_URL,
    loadComponent: () =>
      import('../support-page/support-page.component').then((c) => c.SupportPageComponent),
  },
];
