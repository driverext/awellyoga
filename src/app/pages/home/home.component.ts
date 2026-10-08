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
      title: 'Online Yoga Classes, Private Sessions, Workshops, and Retreats',
      description:
        'Online yoga for anyone, anywhere: live Hatha Yoga on Zoom Sundays October–January at 11 a.m. EST (UTC−5), $15 USD / €12 EUR, plus private sessions, workshops, and retreats.',
      path: '/',
      image: '/assets/classes/neuroyoga-therapeutic-yoga.jpg'
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
        id: 'home-organization',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: STUDIO_CONTACT.name,
          description:
            'Online yoga and therapeutic movement offering live classes, private sessions, workshops, and retreats.',
          url: SITE_URL,
          image: `${SITE_URL}/assets/classes/neuroyoga-therapeutic-yoga.jpg`,
          telephone: STUDIO_CONTACT.phoneSchema,
          email: STUDIO_CONTACT.email,
          sameAs: [`${SITE_URL}/about`, `${SITE_URL}/schedule`]
        }
      }
    ]);
  }
}
