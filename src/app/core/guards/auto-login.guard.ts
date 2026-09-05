import { Router } from "@angular/router";
import { AuthStateService } from "../../features/services/auth-state-service/auth-state.service";
import { inject } from "@angular/core";
import { Links } from "../constants/links";

import type { CanActivateFn } from "@angular/router";

export const noLoginGuard: CanActivateFn = () => {
  const authState: AuthStateService = inject(AuthStateService);
  const router: Router = inject(Router);

  if (authState.isTokenValid()) {
    void router.navigate([Links.UPLOADS_URL]);
    return false;
  }
  return true;
}
