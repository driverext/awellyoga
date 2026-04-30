import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetreatsService } from '../../services/retreats.service';
import { NewlinePipe } from '../../pipes/newline.pipe';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { CurrencyPreferenceService } from '../../services/currency-preference.service';

@Component({
  selector: 'app-retreat-details',
  standalone: true,
  imports: [CommonModule, NewlinePipe, PaymentModalComponent],
  templateUrl: './retreat-details.component.html',
  styleUrls: ['./retreat-details.component.css']
})
export class RetreatDetailsComponent implements OnInit {
  retreat: any;
  isPaymentModalVisible = false;

  constructor(
    private route: ActivatedRoute,
    private retreatsService: RetreatsService,
    public currencyPreference: CurrencyPreferenceService
  ) {}

  ngOnInit() {
    const retreatId = this.route.snapshot.paramMap.get('id');
    if (retreatId) {
      this.retreat = this.retreatsService.getRetreatById(retreatId);
    }
  }

  openPaymentModal(): void {
    this.currencyPreference.setCurrencyOverride(this.currencyPreference.isUsdPrimary ? 'usd' : 'eur');
    this.isPaymentModalVisible = true;
  }

  closePaymentModal(): void {
    this.isPaymentModalVisible = false;
  }
}
