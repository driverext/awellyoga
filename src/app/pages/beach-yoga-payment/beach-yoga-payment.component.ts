import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { TrustedNavigationService } from '../../services/trusted-navigation.service';
import { SeoService } from '../../services/seo.service';
import { CmsEvent } from '../../services/cms/cms.models';

const BEACH_YOGA_PAYMENT_EVENT: CmsEvent = {
  id: 'special-event-immersive-beach-yoga-2026-05-16',
  title: 'Immersive Beach Yoga + Brunch',
  eventType: 'Special Event',
  instructorName: 'Arieta Berisha Kirk',
  startDate: '2026-05-16T09:00:00-04:00',
  location: 'Chases on the Beach, 3401 S Atlantic Ave, New Smyrna Beach, FL 32169',
  priceLabel: '$35 • Includes immersive headset experience + $10 brunch voucher',
  spotsBooked: 0,
  maxSpots: 40,
  platformFeePercent: 30,
  unitAmountCents: 3500,
  currency: 'usd'
};

@Component({
  selector: 'app-beach-yoga-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beach-yoga-payment.component.html',
  styleUrl: './beach-yoga-payment.component.css'
})
export class BeachYogaPaymentComponent {
  email = '';
  loading = false;
  error = '';

  constructor(
    private bookingService: BookingService,
    private trustedNavigation: TrustedNavigationService,
    private seo: SeoService
  ) {
    this.seo.updatePage({
      title: 'Complete Payment | Immersive Beach Yoga + Brunch',
      description:
        'Complete payment for the May 16 immersive beach yoga and brunch event at Chases on the Beach.',
      path: '/beach-yoga-payment'
    });
  }

  async submit(): Promise<void> {
    const email = this.email.trim().toLowerCase();
    if (!this.isValidEmail(email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const result = await this.bookingService.createCheckoutSession(
        BEACH_YOGA_PAYMENT_EVENT,
        email,
        BEACH_YOGA_PAYMENT_EVENT.maxSpots ?? null
      );

      if (result.url && this.trustedNavigation.redirectToTrustedUrl(result.url)) {
        return;
      }

      this.error = result.error || 'Could not start checkout right now.';
    } catch (error) {
      this.error = (error as Error).message || 'Could not start checkout right now.';
    } finally {
      this.loading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
