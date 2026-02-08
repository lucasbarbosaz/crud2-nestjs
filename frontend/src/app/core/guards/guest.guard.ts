import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token) {
    return true;
  }
  const role = auth.user?.role;
  if (role === 'ADMIN') {
    return router.parseUrl('/clientes');
  }
  return router.parseUrl('/produtos');
};
