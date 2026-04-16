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

export interface DashboardOverview {
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  totalRevenueCents: number;
  currency: string;
}

export interface DashboardEventSummary {
  eventTitle: string;
  bookingsCount: number;
  revenueCents: number;
}

export interface DashboardBooking {
  id: string;
  eventTitle: string;
  eventStart?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  paymentStatus?: string | null;
  bookingStatus?: string | null;
  createdAt?: string | null;
}

export interface DashboardPrivateSessionRequest {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  goal?: string | null;
  availability?: string | null;
  status?: string | null;
  created_at?: string | null;
}

export interface BookingDashboardResponse {
  overview: DashboardOverview;
  topEvents: DashboardEventSummary[];
  recentBookings: DashboardBooking[];
  privateSessionRequests: DashboardPrivateSessionRequest[];
  error?: string;
}

export interface PrivateSessionRequestPayload {
  name: string;
  email: string;
  phone?: string;
  goal: string;
  availability: string;
  notes?: string;
  source?: string;
}

interface PrivateSessionRequestResponse {
  id?: string;
  status?: string;
  error?: string;
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

  async createPrivateSessionRequest(payload: PrivateSessionRequestPayload): Promise<PrivateSessionRequestResponse> {
    if (!this.edgeFunctionsBaseUrl) {
      return {
        error: 'Booking backend is not configured yet.'
      };
    }

    const response = await fetch(`${this.edgeFunctionsBaseUrl}/private-session-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as PrivateSessionRequestResponse;
    if (!response.ok) {
      throw new Error(data.error || 'Could not submit private session request.');
    }

    return data;
  }

  async getBookingDashboard(): Promise<BookingDashboardResponse> {
    if (!this.edgeFunctionsBaseUrl) {
      throw new Error('Booking backend is not configured yet.');
    }

    const response = await fetch(`${this.edgeFunctionsBaseUrl}/booking-dashboard`, {
      method: 'GET'
    });

    const data = (await response.json()) as BookingDashboardResponse;
    if (!response.ok) {
      throw new Error(data.error || 'Could not load booking dashboard.');
    }

    return data;
  }
}
