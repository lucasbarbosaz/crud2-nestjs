import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../auth/auth.models';

export const rolesGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] ?? []) as UserRole[];
  if (roles.length === 0) return true;
  if (auth.hasRole(roles)) return true;
  return router.parseUrl('/produtos');
};
