import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BookingService,
  DashboardBooking,
  DashboardEventSummary,
  DashboardOverview
} from '../../services/booking.service';
import { DashboardAuthService } from '../../services/dashboard-auth.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-retreat-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './retreat-dashboard.component.html',
  styleUrl: './retreat-dashboard.component.css'
})
export class RetreatDashboardComponent implements OnInit {
  loading = true;
  error = '';
  overview: DashboardOverview = {
    totalBookings: 0,
    paidBookings: 0,
    pendingBookings: 0,
    totalRevenueCents: 0,
    currency: 'usd'
  };
  topEvents: DashboardEventSummary[] = [];
  recentBookings: DashboardBooking[] = [];

  constructor(
    private bookingService: BookingService,
    private dashboardAuth: DashboardAuthService,
    private router: Router,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.updatePage({
      title: 'Retreat Dashboard',
      description: 'Secure retreat-only dashboard for partner visibility into bookings and revenue.',
      path: '/dashboard/retreats'
    });
    void this.load();
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  money(cents: number | null | undefined): number {
    return (typeof cents === 'number' ? cents : 0) / 100;
  }

  async signOut(): Promise<void> {
    this.dashboardAuth.clear('retreat');
    await this.router.navigate(['/dashboard/login'], { queryParams: { next: '/dashboard/retreats' } });
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const data = await this.bookingService.getRetreatDashboard();
      this.overview = data.overview || this.overview;
      this.topEvents = data.topEvents || [];
      this.recentBookings = data.recentBookings || [];
    } catch (error) {
      this.error = (error as Error).message || 'Could not load retreat dashboard.';
    } finally {
      this.loading = false;
    }
  }
}
