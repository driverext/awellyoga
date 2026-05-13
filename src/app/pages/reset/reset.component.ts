import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.css'
})
export class ResetComponent {
  email = '';
  loading = false;
  success = '';
  error = '';

  readonly highlights = [
    'Free one-week RESET PDF',
    'Sent to your inbox when it is ready',
    'Simple therapeutic tools you can return to at home'
  ];

  constructor(private seo: SeoService) {
    this.seo.updatePage({
      title: 'RESET | Free One-Week PDF',
      description:
        'Join the RESET list and receive the free one-week RESET PDF from A-WELL Yoga when it is ready.',
      path: '/reset'
    });
  }

  async submit(): Promise<void> {
    const email = this.email.trim().toLowerCase();

    if (!this.isValidEmail(email)) {
      this.error = 'Please enter a valid email address.';
      this.success = '';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const response = await fetch(`${environment.booking.edgeFunctionsBaseUrl}/reset-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'reset-page'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Could not save your email right now.');
      }

      this.success = 'You’re on the list. We’ll send the free one-week RESET PDF to this email as soon as it’s ready.';
      this.email = '';
    } catch (error) {
      const message = (error as Error).message || '';
      this.error = message.includes('Failed to fetch')
        ? 'Could not connect right now. Please refresh and try again.'
        : message || 'Could not save your email right now.';
    } finally {
      this.loading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
