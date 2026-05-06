import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SITE_URL } from '../../config/site-constants';

@Component({
  selector: 'app-workshops',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workshops.component.html',
  styleUrls: ['./workshops.component.css']
})
export class WorkshopsComponent implements OnInit {
  pathInwardWorkshop = {
    title: 'The Path INWARD',
    date: 'May 30th, 2026',
    time: '6:00 PM - 8:00 PM',
    location: 'CityArt Orlando Florida',
    price: '$35',
    description: 'more to come 🤩',
    image: '/assets/workshops/the-path-inward.jpg',
    bookingUrl: 'https://buy.stripe.com/fZu6oA3Bx71a8ME7Ay8og05'
  };

  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.updatePage({
      title: 'Yoga Workshops and Special Events',
      description:
        'Browse A-WELL Yoga workshops, special events, and deeper-dive experiences designed for community, reflection, and embodied learning.',
      path: '/workshops',
      image: '/assets/workshops/the-path-inward.jpg'
    });

    this.seo.updateJsonLd([
      {
        id: 'workshops-breadcrumbs',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Workshops', item: `${SITE_URL}/workshops` }
          ]
        }
      },
      {
        id: 'workshop-event',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: this.pathInwardWorkshop.title,
          startDate: '2026-05-30T18:00:00-04:00',
          endDate: '2026-05-30T20:00:00-04:00',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: this.pathInwardWorkshop.location,
            address: this.pathInwardWorkshop.location
          },
          offers: {
            '@type': 'Offer',
            price: '35',
            priceCurrency: 'USD',
            url: this.pathInwardWorkshop.bookingUrl,
            availability: 'https://schema.org/InStock'
          },
          url: `${SITE_URL}/workshops`
        }
      }
    ]);
  }
}
