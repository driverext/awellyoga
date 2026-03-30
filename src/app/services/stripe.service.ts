import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
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

  // This method will be used to prepare checkout data
  // In a real app, this would call your backend to create a Stripe session
  async prepareCheckout(retreatData: any): Promise<any> {
    // For now, return the retreat data
    // TODO: Implement backend call to create Stripe checkout session
    return {
      retreat: retreatData,
      amount: retreatData.price || 1500, // Default price in USD
      sessionReady: false,
      message: 'Backend integration needed to complete payment setup'
    };
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    // This would typically be done on your backend
    // For now, we'll use the checkout method above
    throw new Error('Payment Intent creation should be done on the backend');
  }
} 