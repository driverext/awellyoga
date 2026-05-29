import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { DashboardAuthService, DashboardScope } from '../../services/dashboard-auth.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-dashboard-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-login.component.html',
  styleUrl: './dashboard-login.component.css'
})
export class DashboardLoginComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  error = '';
  scope: DashboardScope = 'admin';
  nextUrl = '/dashboard';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private dashboardAuth: DashboardAuthService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    const requestedNext = this.route.snapshot.queryParamMap.get('next') || '/dashboard';
    this.nextUrl = requestedNext.startsWith('/dashboard') ? requestedNext : '/dashboard';
    this.scope = this.dashboardAuth.resolveScopeForPath(this.nextUrl);

    this.seo.updatePage({
      title: this.scope === 'retreat' ? 'Retreat Dashboard Login' : 'Dashboard Login',
      description: 'Secure login for A-WELL Yoga internal dashboards.',
      path: '/dashboard/login'
    });
  }

  heading(): string {
    return 'Dashboard Login';
  }

  description(): string {
    return 'Use your credentials to sign in. We’ll route you to the right dashboard automatically.';
  }

  async submit(): Promise<void> {
    const username = this.username.trim();
    const password = this.password;

    if (!username || !password) {
      this.error = 'Please enter your username and password.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      this.dashboardAuth.clearAll();
      const result = await this.bookingService.resolveDashboardLogin(username, password, this.scope);
      this.dashboardAuth.setAuthHeader(result.scope, result.authHeader);

      const target =
        result.scope === 'retreat'
          ? '/dashboard/retreats'
          : this.nextUrl === '/dashboard/retreats'
            ? '/dashboard'
            : this.nextUrl;

      await this.router.navigateByUrl(target);
    } catch (error) {
      this.error = (error as Error).message || 'Could not sign in.';
    } finally {
      this.loading = false;
    }
  }
}
