import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements OnChanges {
  @Input() retreat: any = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();

  isLoading = false;
  bookingEmail = '';
  bookingError = '';
  selectedOptionIndex = -1;

  constructor(private stripeService: StripeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['retreat'] || changes['isVisible']) {
      this.resetForm();
    }
  }

  get pricingOptions(): any[] {
    return Array.isArray(this.retreat?.pricingCards) ? this.retreat.pricingCards : [];
  }

  get selectedOption(): any | null {
    if (this.selectedOptionIndex < 0 || this.selectedOptionIndex >= this.pricingOptions.length) {
      return null;
    }
    return this.pricingOptions[this.selectedOptionIndex];
  }

  async proceedToPayment(): Promise<void> {
    if (!this.retreat) {
      this.bookingError = 'Retreat details are missing. Please refresh and try again.';
      return;
    }

    if (!this.selectedOption) {
      this.bookingError = 'Please choose your room option to continue.';
      return;
    }

    const email = this.bookingEmail.trim().toLowerCase();
    if (!this.isValidEmail(email)) {
      this.bookingError = 'Please enter a valid email address.';
      return;
    }

    try {
      this.isLoading = true;
      this.bookingError = '';

      const result = await this.stripeService.createRetreatCheckoutSession(
        this.retreat,
        this.selectedOption,
        email,
        typeof window !== 'undefined' ? window.location.pathname : '/retreats'
      );

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      this.bookingError = result.error || 'Could not start checkout. Please try again.';
    } catch (error) {
      this.bookingError = (error as Error).message || 'Could not start checkout. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  selectOption(index: number): void {
    this.selectedOptionIndex = index;
    this.bookingError = '';
  }

  closeModal(): void {
    if (this.isLoading) {
      return;
    }
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatPrice(option: any): string {
    if (!option) {
      return '';
    }

    const eur = option.price || '';
    const usd = option.usdPrice ? ` / ${option.usdPrice}` : '';
    return `${eur}${usd ? ` (${usd.replace(/^\s*\/\s*/, 'approx. ')})` : ''}`;
  }

  private resetForm(): void {
    this.bookingEmail = '';
    this.bookingError = '';
    this.selectedOptionIndex = this.pricingOptions.length > 1 ? -1 : this.pricingOptions.length === 1 ? 0 : -1;
    this.isLoading = false;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
