import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { CurrencyPreferenceService } from './currency-preference.service';

interface RetreatCheckoutResponse {
  url?: string;
  sessionId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private readonly edgeFunctionsBaseUrl = environment.booking?.edgeFunctionsBaseUrl || '';

  constructor(
    private currencyPreference: CurrencyPreferenceService
  ) {
    this.stripePromise = loadStripe(environment.stripe.publishableKey);
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId
    });

    if (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  async createRetreatCheckoutSession(
    retreatData: any,
    pricingOption: any,
    email: string,
    cancelPath = '/retreats'
  ): Promise<RetreatCheckoutResponse> {
    if (!this.edgeFunctionsBaseUrl) {
      throw new Error('Booking backend is not configured yet.');
    }

    const isUsd = this.currencyPreference.currency === 'usd';
    const amountCents = Number(
      isUsd ? pricingOption?.usdAmountCents || 0 : pricingOption?.amountCents || 0
    );
    const currency = String(
      isUsd ? pricingOption?.usdCurrency || 'usd' : pricingOption?.currency || 'eur'
    ).toLowerCase();

    if (!amountCents) {
      throw new Error('This retreat option is missing a live payment amount.');
    }

    const primaryLabel = isUsd ? pricingOption.usdPrice || pricingOption.price : pricingOption.price || pricingOption.usdPrice;
    const secondaryLabel = isUsd ? pricingOption.price : pricingOption.usdPrice;

    const payload = {
      eventId: retreatData.id,
      eventType: 'Retreat',
      title: `${retreatData.title} - ${pricingOption.label}`,
      startDate: retreatData.startDateIso || '',
      endDate: retreatData.endDateIso || '',
      dateLabel: retreatData.dates || '',
      location: retreatData.location,
      priceLabel: `${pricingOption.label} | ${primaryLabel}${secondaryLabel ? ` | ${isUsd ? secondaryLabel : `Approx. ${secondaryLabel}`}` : ''}`,
      unitAmountCents: amountCents,
      currency,
      successPath: '/payment-success',
      cancelPath
    };

    const response = await fetch(`${this.edgeFunctionsBaseUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        email: email.trim().toLowerCase()
      })
    });

    const data = (await response.json()) as RetreatCheckoutResponse;
    if (!response.ok) {
      throw new Error(data.error || 'Could not start retreat checkout.');
    }

    return data;
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    throw new Error('Payment Intent creation should be done on the backend');
  }
}
