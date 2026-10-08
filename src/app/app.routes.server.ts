import { RenderMode } from '@angular/ssr';
import { Links } from './core/constants/links';

import type { ServerRoute } from '@angular/ssr';

const CLIENT_RENDERED_PATHS: readonly string[] = [
  Links.DEFAULT_PATH,
  Links.MEDIA_LIBRARY_URL,
  Links.UPLOAD_TRACK_URL,
  Links.MY_UPLOADS_URL,
  Links.STATISTICS_URL,
  Links.SUPPORT_URL,
  Links.RESET_PASSWORD_URL,
  Links.PROFILE_URL,
];

export const serverRoutes: ServerRoute[] = [
  ...CLIENT_RENDERED_PATHS.map(
    (path: string): ServerRoute => ({
      path,
      renderMode: RenderMode.Client,
    }),
  ),
  {
    path: Links.WILDCARD_PATH,
    renderMode: RenderMode.Prerender,
  },
];
