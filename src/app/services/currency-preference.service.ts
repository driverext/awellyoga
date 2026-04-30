import { Injectable } from '@angular/core';

type SupportedCurrency = 'usd' | 'eur';

const CURRENCY_OVERRIDE_KEY = 'awell_currency_override';

const EUROPEAN_REGION_CODES = new Set([
  'AL', 'AD', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FO',
  'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM', 'IS', 'IT', 'JE', 'LI', 'LT', 'LU', 'LV', 'MC',
  'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SJ', 'SK', 'SM', 'TR', 'UA',
  'VA', 'XK'
]);

@Injectable({ providedIn: 'root' })
export class CurrencyPreferenceService {
  private readonly preferredCurrency: SupportedCurrency;

  constructor() {
    this.preferredCurrency = this.detectPreferredCurrency();
  }

  get currency(): SupportedCurrency {
    const override = this.readOverride();
    return override || this.preferredCurrency;
  }

  get isUsdPrimary(): boolean {
    return this.currency === 'usd';
  }

  setCurrencyOverride(currency: SupportedCurrency): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(CURRENCY_OVERRIDE_KEY, currency);
  }

  clearCurrencyOverride(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(CURRENCY_OVERRIDE_KEY);
  }

  primaryPrice(option: { price?: string; usdPrice?: string }): string {
    return this.isUsdPrimary ? option.usdPrice || option.price || '' : option.price || option.usdPrice || '';
  }

  secondaryPrice(option: { price?: string; usdPrice?: string }): string {
    if (this.isUsdPrimary) {
      return option.price || '';
    }
    return option.usdPrice || '';
  }

  secondaryLabel(option: { price?: string; usdPrice?: string }): string {
    const secondary = this.secondaryPrice(option);
    if (!secondary) {
      return '';
    }
    return this.isUsdPrimary ? secondary : `Approx. ${secondary}`;
  }


  private readOverride(): SupportedCurrency | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const value = window.localStorage.getItem(CURRENCY_OVERRIDE_KEY);
    if (value === 'usd' || value === 'eur') {
      return value;
    }
    return null;
  }

  private detectPreferredCurrency(): SupportedCurrency {
    if (typeof navigator === 'undefined' || typeof Intl === 'undefined') {
      return 'usd';
    }

    const locales = [
      ...(navigator.languages || []),
      navigator.language || ''
    ].filter(Boolean);

    for (const locale of locales) {
      const region = this.extractRegion(locale);
      if (region === 'US') {
        return 'usd';
      }
      if (region && EUROPEAN_REGION_CODES.has(region)) {
        return 'eur';
      }
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.startsWith('America/')) {
      return 'usd';
    }
    if (timeZone.startsWith('Europe/')) {
      return 'eur';
    }

    return 'usd';
  }

  private extractRegion(locale: string): string | null {
    try {
      const normalized = locale.replace('_', '-');
      const region = new Intl.Locale(normalized).maximize().region;
      return region ? region.toUpperCase() : null;
    } catch {
      const match = locale.match(/[-_]([A-Za-z]{2})\b/);
      return match ? match[1].toUpperCase() : null;
    }
  }
}
