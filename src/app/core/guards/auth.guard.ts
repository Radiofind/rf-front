import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthStateService } from "../../features/services/auth-state-service/auth-state.service";
import { Links } from "../constants/links";

import type { CanActivateFn } from "@angular/router";

export const authGuard: CanActivateFn = () => {
  const authState: AuthStateService = inject(AuthStateService);

  const router: Router = inject(Router);

  if (authState.isTokenValid()) {
    return true;
  }

  void router.navigate([Links.LOGIN_URL]);
  return false;
}
