import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetreatsService } from '../../services/retreats.service';
import { NewlinePipe } from '../../pipes/newline.pipe';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { CurrencyPreferenceService } from '../../services/currency-preference.service';
import { SeoService } from '../../services/seo.service';
import { SITE_URL } from '../../config/site-constants';

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
    public currencyPreference: CurrencyPreferenceService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    const retreatId = this.route.snapshot.paramMap.get('id');
    if (retreatId) {
      this.retreat = this.retreatsService.getRetreatById(retreatId);
      if (this.retreat) {
        this.seo.updatePage({
          title: `${this.retreat.title} Retreat`,
          description: this.retreat.introLead || this.retreat.description || 'Explore this A-WELL Yoga retreat experience.',
          path: `/retreats/${retreatId}`,
          image: this.retreat.cardImage || this.retreat.image,
          type: 'article'
        });

        this.seo.updateJsonLd([
          {
            id: 'retreat-details',
            data: {
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: this.retreat.title,
              description: this.retreat.description,
              startDate: this.retreat.startDateIso,
              endDate: this.retreat.endDateIso,
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: 'https://schema.org/EventScheduled',
              location: {
                '@type': 'Place',
                name: this.retreat.venue || this.retreat.location,
                address: this.retreat.location
              },
              image: [this.retreat.cardImage || this.retreat.image].filter(Boolean),
              organizer: {
                '@type': 'Organization',
                name: 'A-WELL Yoga',
                url: SITE_URL
              }
            }
          },
          {
            id: 'retreat-details-breadcrumbs',
            data: {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Retreats', item: `${SITE_URL}/retreats` },
                { '@type': 'ListItem', position: 3, name: this.retreat.title, item: `${SITE_URL}/retreats/${retreatId}` }
              ]
            }
          }
        ]);
      }
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
