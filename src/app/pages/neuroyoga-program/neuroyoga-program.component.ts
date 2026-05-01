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
    email: ''
  };
  loading = false;
  success = '';
  error = '';

  readonly outcomes = [
    'A steadier nervous system baseline you can actually feel in daily life',
    'Therapeutic tools for working with stress, anxiety, and overwhelm in real time',
    'A more supported relationship to breath, movement, rest, and recovery',
    'A 4-week arc that gives the body time to integrate instead of starting over each class'
  ];

  readonly details = [
    { label: 'Format', value: '4-week program · 1 session each week' },
    { label: 'Session Length', value: '90 minutes each' },
    { label: 'Investment', value: '$280 total' },
    { label: 'Start Window', value: 'July 2026' },
    { label: 'Dates', value: 'TBA based on the group' }
  ];

  readonly whoItsFor = [
    'People who feel anxious, overstimulated, depleted, or constantly on',
    'Students who need more therapeutic support than a single drop-in class can offer',
    'Anyone curious about a neuroscience-informed approach to healing through yoga',
    'People who want a steady, supportive pace instead of a performative one'
  ];

  readonly whatToExpect = [
    'One 90-minute guided session each week for four weeks',
    'Breath-led movement, therapeutic regulation practices, and nervous system education',
    'A format designed to build safety, awareness, and resilience week by week',
    'A small-group feel, with final scheduling shaped around the cohort'
  ];

  constructor(private seo: SeoService) {
    this.seo.updatePage({
      title: 'NeuroYoga™ Therapeutic Yoga Program',
      description:
        'Apply for the 4-week NeuroYoga™ Therapeutic Yoga program at A-WELL Yoga. A therapeutic 90-minute weekly format, July start window, and small-group support built around nervous system regulation.',
      path: '/neuroyoga-program'
    });
  }

  scrollToApplication(): void {
    const target = document.getElementById('apply');
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#apply');
  }

  async submitApplication(): Promise<void> {
    const name = this.application.name.trim();
    const email = this.application.email.trim().toLowerCase();

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
      this.application = { name: '', email: '' };
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
