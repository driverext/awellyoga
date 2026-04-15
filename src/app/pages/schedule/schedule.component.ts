import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CmsAnnouncement,
  CmsEvent,
  CmsStudioHour,
  CmsStudioPage
} from '../../services/cms/cms.models';
import { SanityContentService } from '../../services/cms/sanity-content.service';
import { BookingService } from '../../services/booking.service';

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  iso: string;
  eventCount: number;
}

type PricingActionKey = 'single_visit' | 'class_pack' | 'membership';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  private readonly defaultClassCapacity = 7;

  pageTitle = 'Schedule & Pricing';
  pageSubtitle = 'Flexible options to support your yoga journey';
  scheduleHeading = 'Class Schedule';
  scheduleBody =
    "We offer a variety of classes throughout the week to accommodate your busy lifestyle. From early morning sessions to evening wind-downs, you'll find the perfect time to practice.";
  scheduleButtonLabel = 'View Full Schedule';
  scheduleButtonUrl = '/schedule#calendar';
  scheduleNote = 'Schedule updated monthly. Classes subject to change.';
  scheduleImageUrl =
    'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80';
  scheduleImageAlt = 'Yoga class in session';
  studioHours: CmsStudioHour[] = [
    { label: 'Monday-Friday', hours: '6:00am - 9:00pm' },
    { label: 'Saturday', hours: '8:00am - 7:00pm' },
    { label: 'Sunday', hours: '8:00am - 5:00pm' }
  ];

  announcements: CmsAnnouncement[] = [];
  events: CmsEvent[] = [];
  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarMonth = this.startOfMonth(new Date());
  calendarDays: CalendarDay[] = [];
  selectedDate = this.startOfDay(new Date());
  pricingFlowMessage = '';

  bookingEvent: CmsEvent | null = null;
  bookingEmail = '';
  bookingError = '';
  bookingLoading = false;
  singleVisitCheckoutUrl = '';
  classPackCheckoutUrl = '';
  membershipCheckoutUrl = '';

  pricingGroups = [
    {
      title: 'Single Visits',
      subtitle: 'Great if you are new or have a flexible schedule',
      items: ['Single Class - $22', 'First-Time Special - $15', 'Community Class - $12'],
      ctaLabel: 'Book A Single Class',
      preferredType: 'Yoga Class' as CmsEvent['eventType'],
      actionKey: 'single_visit' as PricingActionKey
    },
    {
      title: 'Class Packs',
      subtitle: 'Lower per-class price with more flexibility than memberships',
      items: ['5-Class Pack - $100', '10-Class Pack - $190', '20-Class Pack - $340'],
      ctaLabel: 'Buy A Class Pack',
      preferredType: 'Yoga Class' as CmsEvent['eventType'],
      actionKey: 'class_pack' as PricingActionKey
    },
    {
      title: 'Memberships & Special Rates',
      subtitle: 'Best value for regular practice',
      items: [
        'Basic (8 Classes) - $89/month',
        'Standard (12 Classes) - $119/month',
        'Unlimited - $159/month',
        'Student/Senior - 15% off',
        'Family Plan - 10% off',
        'Annual Membership - Save 20%'
      ],
      ctaLabel: 'Start Membership',
      preferredType: 'Yoga Class' as CmsEvent['eventType'],
      actionKey: 'membership' as PricingActionKey
    }
  ];

  constructor(
    private cmsContent: SanityContentService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.cmsContent.getStudioPage().subscribe((content) => {
        if (content) {
          this.applyStudioPageContent(content);
        }
      })
    );

    this.subscriptions.add(
      this.cmsContent.getActiveAnnouncements(3).subscribe((announcements) => {
        this.announcements = announcements;
      })
    );

    this.subscriptions.add(
      this.cmsContent.getUpcomingEvents(50).subscribe((events) => {
        this.events = events;
        void this.refreshLiveSpots();
        this.syncCalendarSelection();
        this.buildCalendarDays();
      })
    );

    this.buildCalendarDays();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  previousMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.buildCalendarDays();
  }

  nextMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.buildCalendarDays();
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate = this.startOfDay(day.date);
  }

  selectedDateEvents(): CmsEvent[] {
    const key = this.dateKey(this.selectedDate);
    return this.events.filter((event) => this.dateKey(new Date(event.startDate)) === key);
  }

  monthLabel(): string {
    return this.calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  selectedDateHeading(): string {
    return this.selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'numeric',
      day: 'numeric'
    });
  }

  isSelected(day: CalendarDay): boolean {
    return this.dateKey(day.date) === this.dateKey(this.selectedDate);
  }

  openBooking(event: CmsEvent): void {
    if (!this.canBookEvent(event)) {
      this.pricingFlowMessage = `Booking is missing for "${event.title}". Add a Stripe Price ID or booking URL in Sanity.`;
      return;
    }

    if (this.isEventFull(event)) {
      this.pricingFlowMessage = `${event.title} is full. Please choose another class date.`;
      return;
    }

    this.bookingEvent = event;
    this.bookingEmail = '';
    this.bookingError = '';
  }

  closeBookingModal(): void {
    if (this.bookingLoading) {
      return;
    }
    this.bookingEvent = null;
    this.bookingEmail = '';
    this.bookingError = '';
  }

  async submitBooking(): Promise<void> {
    if (!this.bookingEvent) {
      return;
    }

    if (this.isEventFull(this.bookingEvent)) {
      this.bookingError = 'This class is full. Please choose another class.';
      return;
    }

    const email = this.bookingEmail.trim();
    if (!this.isValidEmail(email)) {
      this.bookingError = 'Please enter a valid email address.';
      return;
    }

    this.bookingLoading = true;
    this.bookingError = '';

    try {
      const capacity = this.eventCapacity(this.bookingEvent);
      const result = await this.bookingService.createCheckoutSession(this.bookingEvent, email, capacity);

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      if (result.fallbackUrl) {
        const directUrl = this.buildBookingUrl(this.bookingEvent, email, result.fallbackUrl);
        if (directUrl) {
          window.location.href = directUrl;
          return;
        }
      }

      this.bookingError = result.error || 'Could not start checkout for this class.';
    } catch (error) {
      this.bookingError = (error as Error).message || 'Could not start checkout for this class.';
    } finally {
      this.bookingLoading = false;
    }
  }

  purchasePricingGroup(groupTitle: string): void {
    const group = this.pricingGroups.find((item) => item.title === groupTitle);
    if (!group) {
      return;
    }

    const directUrl = this.pricingCheckoutUrl(group.actionKey);
    if (directUrl) {
      window.location.href = directUrl;
      return;
    }

    const preferredType = group.preferredType || 'Yoga Class';
    const upcoming = this.findUpcomingEvent(preferredType);

    const calendar = document.getElementById('calendar');
    if (calendar) {
      calendar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!upcoming) {
      this.pricingFlowMessage =
        'No dedicated checkout link is set for this pricing option yet. Please choose a class date below.';
      return;
    }

    const eventDate = this.startOfDay(new Date(upcoming.startDate));
    this.selectedDate = eventDate;
    this.calendarMonth = this.startOfMonth(eventDate);
    this.buildCalendarDays();
    this.pricingFlowMessage = `Showing next available ${preferredType.toLowerCase()}: ${upcoming.title}.`;
    this.openBooking(upcoming);
  }

  bookPrivateSession(): void {
    const upcoming = this.findUpcomingEvent('Special Event');
    const calendar = document.getElementById('calendar');
    if (calendar) {
      calendar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!upcoming) {
      this.pricingFlowMessage = 'No private or special sessions are published right now. Please choose another date in the calendar.';
      return;
    }

    const eventDate = this.startOfDay(new Date(upcoming.startDate));
    this.selectedDate = eventDate;
    this.calendarMonth = this.startOfMonth(eventDate);
    this.buildCalendarDays();
    this.pricingFlowMessage = `Showing next available session: ${upcoming.title}.`;
    this.openBooking(upcoming);
  }

  purchaseGiftCard(): void {
    const calendar = document.getElementById('calendar');
    if (calendar) {
      calendar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.pricingFlowMessage = 'Choose any class date to purchase as a gift at checkout.';
  }

  signUpNow(): void {
    const target = document.getElementById('calendar');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.hash = '#calendar';
  }

  private findUpcomingEvent(preferredType: CmsEvent['eventType']): CmsEvent | null {
    const now = Date.now();
    const sortedEvents = [...this.events]
      .filter((event) => new Date(event.startDate).getTime() >= now)
      .filter((event) => !this.isEventFull(event))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const matchingType = sortedEvents.find((event) => event.eventType === preferredType);
    if (matchingType) {
      return matchingType;
    }

    return sortedEvents[0] || null;
  }

  private applyStudioPageContent(content: CmsStudioPage): void {
    this.pageTitle = content.pageTitle || this.pageTitle;
    this.pageSubtitle = content.pageSubtitle || this.pageSubtitle;
    this.scheduleHeading = content.scheduleHeading || this.scheduleHeading;
    this.scheduleBody = content.scheduleBody || this.scheduleBody;
    this.scheduleButtonLabel = content.scheduleButtonLabel || this.scheduleButtonLabel;
    this.scheduleButtonUrl = content.scheduleButtonUrl || this.scheduleButtonUrl;
    this.scheduleNote = content.scheduleNote || this.scheduleNote;
    this.scheduleImageUrl = content.scheduleImageUrl || this.scheduleImageUrl;
    this.scheduleImageAlt = content.scheduleImageAlt || this.scheduleImageAlt;
    this.singleVisitCheckoutUrl = content.singleVisitCheckoutUrl || '';
    this.classPackCheckoutUrl = content.classPackCheckoutUrl || '';
    this.membershipCheckoutUrl = content.membershipCheckoutUrl || '';
    this.studioHours = content.studioHours?.length ? content.studioHours : this.studioHours;
  }

  private pricingCheckoutUrl(actionKey: PricingActionKey): string {
    const url =
      actionKey === 'single_visit'
        ? this.singleVisitCheckoutUrl
        : actionKey === 'class_pack'
        ? this.classPackCheckoutUrl
        : this.membershipCheckoutUrl;

    if (!url) {
      return '';
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  eventCapacity(event: CmsEvent): number | null {
    if (typeof event.maxSpots === 'number' && event.maxSpots > 0) {
      return event.maxSpots;
    }

    if (event.eventType === 'Yoga Class') {
      return this.defaultClassCapacity;
    }

    return null;
  }

  spotsRemaining(event: CmsEvent): number | null {
    const capacity = this.eventCapacity(event);
    if (capacity === null) {
      return null;
    }

    const booked = Math.max(0, event.spotsBooked || 0);
    return Math.max(0, capacity - booked);
  }

  isEventFull(event: CmsEvent): boolean {
    const remaining = this.spotsRemaining(event);
    return remaining !== null && remaining <= 0;
  }

  bookingButtonLabel(event: CmsEvent): string {
    if (this.isEventFull(event)) {
      return 'Class Full';
    }

    return 'Book';
  }

  private buildCalendarDays(): void {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    const end = new Date(lastDay);
    end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const date = new Date(cursor);
      const iso = this.dateKey(date);
      const eventCount = this.events.filter((event) => this.dateKey(new Date(event.startDate)) === iso).length;
      days.push({
        date,
        inCurrentMonth: date.getMonth() === month,
        iso,
        eventCount
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    this.calendarDays = days;
  }

  private buildBookingUrl(event: CmsEvent, email: string, rawInputUrl?: string): string | null {
    const rawUrl = (rawInputUrl || event.bookingUrl || event.ctaUrl || '').trim();
    if (!rawUrl) {
      return null;
    }

    try {
      const bookingUrl = new URL(rawUrl);
      if (bookingUrl.protocol !== 'https:' && bookingUrl.protocol !== 'http:') {
        return null;
      }
      bookingUrl.searchParams.set('prefilled_email', email);
      bookingUrl.searchParams.set('client_reference_id', `${this.dateKey(this.selectedDate)}-${Date.now()}`);
      return bookingUrl.toString();
    } catch {
      return null;
    }
  }

  private canBookEvent(event: CmsEvent): boolean {
    return !!event.stripePriceId || !!this.buildBookingUrl(event, 'placeholder@example.com');
  }

  private async refreshLiveSpots(): Promise<void> {
    const eventIds = this.events
      .map((event) => event.id || '')
      .filter((id): id is string => !!id);

    if (!eventIds.length) {
      return;
    }

    try {
      const counts = await this.bookingService.getEventBookingCounts(eventIds);
      if (!counts || Object.keys(counts).length === 0) {
        return;
      }

      this.events = this.events.map((event) => {
        if (!event.id || typeof counts[event.id] !== 'number') {
          return event;
        }
        return {
          ...event,
          spotsBooked: counts[event.id]
        };
      });
      this.buildCalendarDays();
    } catch {
      // Keep CMS fallback values when live counts fail.
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private syncCalendarSelection(): void {
    if (this.selectedDateEvents().length > 0) {
      return;
    }

    if (this.events.length > 0) {
      const firstEventDate = this.startOfDay(new Date(this.events[0].startDate));
      this.selectedDate = firstEventDate;
      this.calendarMonth = this.startOfMonth(firstEventDate);
    }
  }


  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
  }
}
