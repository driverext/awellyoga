import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RetreatsService } from '../../services/retreats.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-retreats',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  templateUrl: './retreats.component.html',
  styleUrls: ['./retreats.component.css']
})
export class RetreatsComponent implements OnInit {
  upcomingRetreats: any[] = [];
  pastRetreats: any[] = [];
  testimonials: any[] = [];
  faq: any[] = [];
  
  // Payment modal state
  selectedRetreat: any = null;
  isPaymentModalVisible = false;

  constructor(private retreatsService: RetreatsService) {}

  ngOnInit() {
    this.upcomingRetreats = this.retreatsService.getAllRetreats();
  }

  get featuredRetreats() {
    return this.retreatsService.getFeaturedRetreats();
  }

  openPaymentModal(retreat: any) {
    this.selectedRetreat = retreat;
    this.isPaymentModalVisible = true;
  }

  closePaymentModal() {
    this.isPaymentModalVisible = false;
    this.selectedRetreat = null;
  }

  onPaymentSuccess(paymentData: any) {
    console.log('Payment successful:', paymentData);
    this.closePaymentModal();
    // Handle successful payment (show confirmation, redirect, etc.)
  }
} 