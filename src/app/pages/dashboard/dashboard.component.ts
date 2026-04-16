import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  BookingDashboardResponse,
  BookingService,
  DashboardBooking,
  DashboardEventSummary,
  DashboardOverview,
  DashboardPrivateSessionRequest
} from '../../services/booking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
  privateSessionRequests: DashboardPrivateSessionRequest[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    void this.load();
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  money(cents: number | null | undefined, currency = 'USD'): number {
    const value = typeof cents === 'number' ? cents : 0;
    return value / 100;
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const data: BookingDashboardResponse = await this.bookingService.getBookingDashboard();
      this.overview = data.overview || this.overview;
      this.topEvents = data.topEvents || [];
      this.recentBookings = data.recentBookings || [];
      this.privateSessionRequests = data.privateSessionRequests || [];
    } catch (error) {
      this.error = (error as Error).message || 'Could not load dashboard data.';
    } finally {
      this.loading = false;
    }
  }
}
