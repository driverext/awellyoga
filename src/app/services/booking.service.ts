import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CmsEvent } from './cms/cms.models';

interface CreateCheckoutResponse {
  url?: string;
  sessionId?: string;
  fallbackUrl?: string;
  error?: string;
  code?: string;
}

interface BookingCountResponse {
  counts?: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly edgeFunctionsBaseUrl = environment.booking?.edgeFunctionsBaseUrl || '';

  async createCheckoutSession(event: CmsEvent, email: string, maxSpots: number | null): Promise<CreateCheckoutResponse> {
    if (!this.edgeFunctionsBaseUrl) {
      return {
        error: 'Booking backend is not configured yet.',
        code: 'BOOKING_BACKEND_MISSING'
      };
    }

    const payload = {
      eventId: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      instructorName: event.instructorName,
      instructorStripeAccountId: event.instructorStripeAccountId,
      priceLabel: event.priceLabel,
      stripePriceId: event.stripePriceId,
      bookingUrl: event.bookingUrl || event.ctaUrl,
      platformFeePercent: event.platformFeePercent,
      maxSpots: maxSpots || undefined,
      email
    };

    const response = await fetch(`${this.edgeFunctionsBaseUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as CreateCheckoutResponse;
    if (!response.ok) {
      throw new Error(data.error || 'Could not start checkout.');
    }

    return data;
  }

  async getEventBookingCounts(eventIds: string[]): Promise<Record<string, number>> {
    if (!this.edgeFunctionsBaseUrl || !eventIds.length) {
      return {};
    }

    const response = await fetch(`${this.edgeFunctionsBaseUrl}/event-booking-counts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventIds })
    });

    if (!response.ok) {
      return {};
    }

    const data = (await response.json()) as BookingCountResponse;
    return data.counts || {};
  }
}
