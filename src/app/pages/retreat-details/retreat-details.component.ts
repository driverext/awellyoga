import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetreatsService } from '../../services/retreats.service';
import { NewlinePipe } from '../../pipes/newline.pipe';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';

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
    private retreatsService: RetreatsService
  ) {}

  ngOnInit() {
    const retreatId = this.route.snapshot.paramMap.get('id');
    if (retreatId) {
      this.retreat = this.retreatsService.getRetreatById(retreatId);
    }
  }

  openPaymentModal(): void {
    this.isPaymentModalVisible = true;
  }

  closePaymentModal(): void {
    this.isPaymentModalVisible = false;
  }
}
