import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TrustedNavigationService {
  private readonly trustedCheckoutHosts = new Set([
    'buy.stripe.com',
    'checkout.stripe.com'
  ]);

  getTrustedRedirectUrl(rawUrl: string | null | undefined): string | null {
    const parsed = this.parseUrl(rawUrl);
    if (!parsed || !this.isTrustedRedirectHost(parsed)) {
      return null;
    }

    return parsed.toString();
  }

  buildTrustedBookingUrl(
    rawUrl: string | null | undefined,
    email: string,
    clientReferenceId: string
  ): string | null {
    const parsed = this.parseUrl(rawUrl);
    if (!parsed || !this.isTrustedRedirectHost(parsed)) {
      return null;
    }

    parsed.searchParams.set('prefilled_email', email);
    parsed.searchParams.set('client_reference_id', clientReferenceId);
    return parsed.toString();
  }

  redirectToTrustedUrl(rawUrl: string | null | undefined): boolean {
    const trustedUrl = this.getTrustedRedirectUrl(rawUrl);
    if (!trustedUrl || typeof window === 'undefined') {
      return false;
    }

    // Keep all browser redirects running through one place so checkout flows do not
    // accidentally start trusting arbitrary URLs from CMS content or API responses.
    window.location.assign(trustedUrl);
    return true;
  }

  private parseUrl(rawUrl: string | null | undefined): URL | null {
    const value = (rawUrl || '').trim();
    if (!value) {
      return null;
    }

    try {
      const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : undefined);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private isTrustedRedirectHost(url: URL): boolean {
    // Same-origin links are safe for internal flows. External redirects are limited
    // to Stripe checkout domains on purpose.
    if (typeof window !== 'undefined' && url.origin === window.location.origin) {
      return true;
    }

    return this.trustedCheckoutHosts.has(url.hostname);
  }
}
