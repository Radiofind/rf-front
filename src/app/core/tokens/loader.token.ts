import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SKIP_GLOBAL_LOADER: HttpContextToken<boolean> = new HttpContextToken<boolean>(
  () => false,
);

export function skipGlobalLoader(context: HttpContext = new HttpContext()): HttpContext {
  return context.set(SKIP_GLOBAL_LOADER, true);
}
