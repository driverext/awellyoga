import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements OnInit {
  @Input() retreat: any = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();

  isLoading = false;
  checkoutData: any = null;

  constructor(private stripeService: StripeService) {}

  ngOnInit() {
    if (this.retreat) {
      this.preparePayment();
    }
  }

  async preparePayment() {
    try {
      this.isLoading = true;
      this.checkoutData = await this.stripeService.prepareCheckout(this.retreat);
    } catch (error) {
      console.error('Error preparing payment:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async proceedToPayment() {
    if (!this.checkoutData) {
      alert('Payment not ready. Please contact us directly for booking.');
      return;
    }

    try {
      this.isLoading = true;
      
      // For now, show a message that backend integration is needed
      alert(`Payment processing will be implemented once backend is ready.\n\nRetreat: ${this.retreat.title}\nLocation: ${this.retreat.location}\nDates: ${this.retreat.dates}\nEstimated Price: $${this.checkoutData.amount}\n\nPlease contact us directly at arietabk@gmail.com for booking.`);
      
      // TODO: Implement actual Stripe checkout when backend is ready
      // await this.stripeService.redirectToCheckout(sessionId);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again or contact us directly.');
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
} 