import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { SeoService } from '../../services/seo.service';
import { TrustedNavigationService } from '../../services/trusted-navigation.service';
import { NEURONIDRA_EVENT, NEURONIDRA_IMAGE, NEURONIDRA_CASH_NOTE } from '../../../../shared/neuronidra-event';
import { SITE_URL } from '../../config/site-constants';

@Component({
  selector: 'app-neuronidra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './neuronidra.component.html',
  styleUrls: ['../workshops/workshops.component.css', '../beach-yoga-payment/beach-yoga-payment.component.css', './neuronidra.component.css']
})
export class NeuroNidraComponent implements OnInit, OnDestroy {
  readonly event = NEURONIDRA_EVENT;
  readonly image = NEURONIDRA_IMAGE;
  readonly cashNote = NEURONIDRA_CASH_NOTE;
  name = '';
  email = '';
  phone = '';
  remaining: number | null = null;
  loading = false;
  error = '';
  availabilityError = '';
  confirmation = '';
  private timer?: ReturnType<typeof setInterval>;

  constructor(private booking: BookingService, private seo: SeoService, private navigation: TrustedNavigationService) {}

  ngOnInit(): void {
    this.seo.updatePage({
      title: 'NeuroNidra™ in Prishtina — Guided Deep Rest with Arieta Berisha Kirk',
      exactTitle: true,
      description: 'NeuroNidra™ by Arieta Berisha Kirk: a guided deep-rest practice for anxiety, grief and overthinking. Somatic, vagal, neural. Sessions in Prishtina.',
      path: '/neuronidra', image: this.image
    });
    this.updateEventSchema();
    void this.refreshAvailability();
    this.timer = setInterval(() => void this.refreshAvailability(), 30000);
  }

  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  get closed(): boolean { return this.remaining === 0 || Date.now() >= Date.parse(this.event.startDate); }

  async refreshAvailability(): Promise<void> {
    try {
      const counts = await this.booking.getEventBookingCounts([this.event.id], true);
      this.remaining = Math.max(0, this.event.maxSpots - (counts[this.event.id] || 0));
      this.availabilityError = '';
      this.updateEventSchema();
    } catch {
      this.remaining = null;
      this.availabilityError = 'Availability could not be checked. Please retry before booking.';
    }
  }

  async reserve(method: 'card' | 'cash'): Promise<void> {
    if (this.loading || this.confirmation) return;
    this.error = '';
    if (this.closed || this.remaining === null) { this.error = 'Booking is closed or availability could not be checked.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) { this.error = 'Please enter a valid email address.'; return; }
    if (method === 'cash' && (!this.name.trim() || !/^[+\d\s().-]{7,30}$/.test(this.phone.trim()) || this.phone.replace(/\D/g, '').length < 7 || this.phone.replace(/\D/g, '').length > 15)) {
      this.error = 'Please enter your name and a valid phone number for your cash reservation.'; return;
    }
    this.loading = true;
    try {
      if (method === 'card') {
        const result = await this.booking.createCheckoutSession(this.event, this.email.trim(), this.event.maxSpots, 'neuronidra-page');
        if (!result.url || !this.navigation.redirectToTrustedUrl(result.url)) throw new Error(result.error || 'Could not open secure checkout.');
      } else {
        const result = await this.booking.createCashReservation(this.event.id, this.name.trim(), this.email.trim(), this.phone.trim());
        this.confirmation = `Your spot is reserved. ${this.cashNote}`;
        if (result.notificationWarning) this.confirmation += ' The confirmation email could not be sent; keep your booking reference.';
        this.confirmation += ` Booking reference: ${result.bookingId}`;
      }
    } catch (error) { this.error = (error as Error).message || 'Could not book your spot.'; }
    finally { this.loading = false; await this.refreshAvailability(); }
  }

  private updateEventSchema(): void {
    this.seo.updateJsonLd([{ id: 'neuronidra-event', data: {
      '@context': 'https://schema.org', '@type': 'Event', name: this.event.title,
      startDate: this.event.startDate, endDate: this.event.endDate,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
      maximumAttendeeCapacity: this.event.maxSpots,
      location: { '@type': 'Place', name: this.event.location, address: { '@type': 'PostalAddress', addressLocality: 'Prishtina', addressCountry: 'XK' } },
      performer: { '@type': 'Person', name: this.event.instructorName }, image: `${SITE_URL}${this.image}`,
      description: this.event.summary, url: `${SITE_URL}/neuronidra`,
      offers: { '@type': 'Offer', price: 30, priceCurrency: 'EUR', url: `${SITE_URL}/neuronidra#booking`, availability: this.closed ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' }
    }}]);
  }
}
