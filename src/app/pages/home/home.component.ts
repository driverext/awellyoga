import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SITE_URL, STUDIO_CONTACT } from '../../config/site-constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.updatePage({
      title: 'Sanford Yoga Classes, Private Sessions, Workshops, and Retreats',
      description:
        'A-WELL Yoga offers Sanford yoga classes, private sessions, workshops, retreats, and therapeutic nervous-system-aware support for students seeking grounded, approachable practice.',
      path: '/',
      image: '/assets/home/studio.jpg'
    });

    this.seo.updateJsonLd([
      {
        id: 'home-website',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: STUDIO_CONTACT.name
        }
      },
      {
        id: 'home-local-business',
        data: {
          '@context': 'https://schema.org',
          '@type': 'SportsActivityLocation',
          '@id': `${SITE_URL}/#localbusiness`,
          name: STUDIO_CONTACT.name,
          description:
            'Yoga studio and therapeutic movement space offering classes, workshops, private sessions, and retreats.',
          url: SITE_URL,
          image: `${SITE_URL}/assets/home/studio.jpg`,
          telephone: STUDIO_CONTACT.phoneSchema,
          email: STUDIO_CONTACT.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: STUDIO_CONTACT.addressLine,
            addressLocality: STUDIO_CONTACT.city,
            addressRegion: STUDIO_CONTACT.region,
            postalCode: STUDIO_CONTACT.postalCode,
            addressCountry: STUDIO_CONTACT.country
          },
          areaServed: {
            '@type': 'City',
            name: STUDIO_CONTACT.city
          },
          sameAs: [`${SITE_URL}/about`, `${SITE_URL}/schedule`]
        }
      }
    ]);
  }
}
