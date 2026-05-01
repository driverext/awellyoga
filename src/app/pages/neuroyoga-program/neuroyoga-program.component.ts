import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-neuroyoga-program',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './neuroyoga-program.component.html',
  styleUrls: ['./neuroyoga-program.component.css']
})
export class NeuroyogaProgramComponent {
  application = {
    name: '',
    email: '',
    whatsapp: ''
  };
  loading = false;
  success = '';
  error = '';

  readonly outcomes = [
    'A steadier nervous system baseline you can actually feel',
    'Tools for working with stress, anxiety, and overwhelm in real time',
    'A more grounded relationship to breath, movement, and recovery',
    'Weekly support that builds over four sessions instead of one-off drops'
  ];

  readonly details = [
    { label: 'Format', value: '4-week program · 1 session each week' },
    { label: 'Investment', value: '$280 total' },
    { label: 'Start Window', value: 'July 2026' },
    { label: 'Dates', value: 'TBA based on the group' }
  ];

  readonly whoItsFor = [
    'People who feel anxious, overstimulated, or constantly on',
    'Students who want more support than a single drop-in class can offer',
    'Anyone curious about a therapeutic, neuroscience-informed approach to yoga',
    'People who want consistency and accountability without an intimidating pace'
  ];

  readonly whatToExpect = [
    'One guided session each week for four weeks',
    'Breath-led movement, awareness work, and nervous system education',
    'A format designed to build week by week instead of starting over every class',
    'A small-group feel, with timing finalized around the cohort'
  ];

  constructor(private seo: SeoService) {
    this.seo.updatePage({
      title: 'NeuroYoga™ Therapeutic Yoga Program',
      description:
        'Apply for the 4-week NeuroYoga™ Therapeutic Yoga program at A-WELL Yoga. A July start, $280 investment, and a small-group format built around nervous system support.',
      path: '/neuroyoga-program'
    });
  }

  async submitApplication(): Promise<void> {
    const name = this.application.name.trim();
    const email = this.application.email.trim().toLowerCase();
    const whatsapp = this.application.whatsapp.trim();

    if (!name) {
      this.error = 'Please enter your name.';
      this.success = '';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Please enter a valid email address.';
      this.success = '';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const response = await fetch(`${environment.booking.edgeFunctionsBaseUrl}/neuroyoga-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          program: 'NeuroYoga™ Therapeutic Yoga',
          investment: '$280',
          startWindow: 'July 2026',
          scheduleNote: 'Dates TBA based on group formation',
          source: 'neuroyoga-program-page'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Could not submit your application. Please try again.');
      }

      this.success = 'Application received. We will reach out with July timing options once the group is taking shape.';
      this.application = { name: '', email: '', whatsapp: '' };
    } catch (error) {
      const message = (error as Error).message || '';
      this.error = message.includes('Failed to fetch')
        ? 'Could not connect. Please refresh and try again. If this continues, open awellyoga.com with https.'
        : message || 'Could not submit your application. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
