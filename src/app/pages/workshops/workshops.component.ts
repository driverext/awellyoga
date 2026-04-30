import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

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
    image: '/assets/workshop1.jpg',
    bookingUrl: 'https://buy.stripe.com/fZu6oA3Bx71a8ME7Ay8og05'
  };

  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.updatePage({
      title: 'Yoga Workshops and Special Events',
      description:
        'Browse A-WELL Yoga workshops, special events, and deeper-dive experiences designed for community, reflection, and embodied learning.',
      path: '/workshops',
      image: '/assets/workshop1.jpg'
    });
  }
}
