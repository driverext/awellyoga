import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService, CheckoutSessionSummary } from '../../services/booking.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  loading = true;
  error = '';
  summary: CheckoutSessionSummary | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    void this.loadSummary();
  }

  get isRetreat(): boolean {
    return this.summary?.eventType === 'Retreat' || /retreat/i.test(this.summary?.eventTitle || '');
  }

  get isWorkshop(): boolean {
    return this.summary?.eventType === 'Workshop' || /workshop/i.test(this.summary?.eventTitle || '');
  }

  get primaryCtaLabel(): string {
    if (this.isRetreat) {
      return 'View Retreat Details';
    }
    if (this.isWorkshop) {
      return 'View Workshops';
    }
    return 'Back To Schedule';
  }

  get primaryCtaLink(): string {
    if (this.isRetreat) {
      return '/retreats';
    }
    if (this.isWorkshop) {
      return '/workshops';
    }
    return '/schedule';
  }

  get supportLine(): string {
    if (this.isRetreat) {
      return 'Your spot is held. We will follow up with retreat preparation details, timing notes, and anything else you need before arrival.';
    }
    if (this.isWorkshop) {
      return 'Your spot is held. Keep an eye on your inbox for workshop-specific notes and any arrival details.';
    }
    return 'Your spot is confirmed. Keep the confirmation email handy in case you need the location, time, or any follow-up details.';
  }

  money(cents: number | null | undefined): number {
    return typeof cents === 'number' ? cents / 100 : 0;
  }

  whenLabel(): string {
    if (!this.summary) {
      return '';
    }
    if (this.summary.eventDateLabel) {
      return this.summary.eventDateLabel;
    }
    if (this.summary.eventStart && this.summary.eventEnd) {
      return `${this.summary.eventStart} - ${this.summary.eventEnd}`;
    }
    return this.summary.eventStart || '';
  }

  private async loadSummary(): Promise<void> {
    const sessionId = (this.route.snapshot.queryParamMap.get('session_id') || '').trim();
    if (!sessionId) {
      this.loading = false;
      this.error = 'We could not find this booking summary, but your payment may still be complete. Please check your email confirmation.';
      return;
    }

    try {
      this.summary = await this.bookingService.getCheckoutSessionSummary(sessionId);
    } catch (error) {
      this.error = (error as Error).message || 'Could not load booking confirmation.';
    } finally {
      this.loading = false;
    }
  }
}
