import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DashboardAuthService } from '../services/dashboard-auth.service';

export const retreatDashboardAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(DashboardAuthService);
  const router = inject(Router);

  if (auth.isAuthed('retreat')) {
    return true;
  }

  return router.createUrlTree(['/dashboard/login'], {
    queryParams: { next: state.url }
  });
};
