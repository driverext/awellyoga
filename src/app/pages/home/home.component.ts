import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

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
      title: 'Sanford Yoga Classes, Workshops, Retreats, and Therapeutic Movement',
      description:
        'A-WELL Yoga offers studio classes, workshops, private sessions, retreats, and NeuroYoga-based therapeutic support in Sanford, Florida.',
      path: '/',
      image: '/assets/home/studio.jpg'
    });

    this.seo.setJsonLd('home-local-business', {
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name: 'A-WELL Yoga',
      description:
        'Yoga studio and therapeutic movement space offering classes, workshops, private sessions, and retreats.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '214 Hickman Dr',
        addressLocality: 'Sanford',
        addressRegion: 'FL',
        postalCode: '32771',
        addressCountry: 'US'
      },
      telephone: '+1-321-230-8833',
      email: 'info@awellyoga.com',
      url: 'https://awellyoga.com',
      sameAs: ['https://awellyoga.com/about', 'https://awellyoga.com/schedule']
    });
  }
}
