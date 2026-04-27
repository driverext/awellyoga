import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  BookingDashboardResponse,
  BookingService,
  DashboardBooking,
  DashboardEventSummary,
  DashboardOverview,
  DashboardPrivateSessionRequest
} from '../../services/booking.service';
import { CmsEvent } from '../../services/cms/cms.models';
import { SanityContentService } from '../../services/cms/sanity-content.service';

interface DashboardClassEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  location?: string;
  attendees: DashboardBooking[];
}

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  eventCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = '';
  calendarMonth = this.startOfMonth(new Date());
  selectedDate = this.startOfDay(new Date());
  calendarDays: CalendarDay[] = [];
  classEvents: DashboardClassEvent[] = [];
  attendanceModalOpen = false;
  selectedAttendanceEvent: DashboardClassEvent | null = null;

  overview: DashboardOverview = {
    totalBookings: 0,
    paidBookings: 0,
    pendingBookings: 0,
    totalRevenueCents: 0,
    currency: 'usd'
  };

  topEvents: DashboardEventSummary[] = [];
  recentBookings: DashboardBooking[] = [];
  privateSessionRequests: DashboardPrivateSessionRequest[] = [];

  constructor(
    private bookingService: BookingService,
    private cmsContent: SanityContentService
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  money(cents: number | null | undefined, currency = 'USD'): number {
    const value = typeof cents === 'number' ? cents : 0;
    return value / 100;
  }

  previousMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.buildCalendarDays();
  }

  nextMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.buildCalendarDays();
  }

  monthLabel(): string {
    return this.calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate = this.startOfDay(day.date);
  }

  isSelected(day: CalendarDay): boolean {
    return this.dateKey(day.date) === this.dateKey(this.selectedDate);
  }

  selectedDateEvents(): DashboardClassEvent[] {
    const key = this.dateKey(this.selectedDate);
    return this.classEvents
      .filter((event) => this.dateKey(new Date(event.startDate)) === key)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  selectedDateHeading(): string {
    return this.selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  openAttendance(event: DashboardClassEvent): void {
    this.selectedAttendanceEvent = event;
    this.attendanceModalOpen = true;
  }

  closeAttendanceModal(): void {
    this.attendanceModalOpen = false;
    this.selectedAttendanceEvent = null;
  }

  hasAttendees(event: DashboardClassEvent | null): boolean {
    return !!event && event.attendees.length > 0;
  }

  paidAttendees(event: DashboardClassEvent | null): DashboardBooking[] {
    if (!event) {
      return [];
    }
    return event.attendees.filter((booking) => booking.bookingStatus === 'paid' || booking.paymentStatus === 'paid');
  }

  pendingAttendees(event: DashboardClassEvent | null): DashboardBooking[] {
    if (!event) {
      return [];
    }
    return event.attendees.filter((booking) => booking.bookingStatus === 'pending' && booking.paymentStatus !== 'paid');
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const [data, cmsEvents] = await Promise.all([
        this.bookingService.getBookingDashboard(),
        firstValueFrom(this.cmsContent.getUpcomingEvents(250))
      ]);

      this.overview = data.overview || this.overview;
      this.topEvents = data.topEvents || [];
      this.recentBookings = data.recentBookings || [];
      this.privateSessionRequests = data.privateSessionRequests || [];
      this.classEvents = this.buildClassEvents(cmsEvents || [], this.recentBookings);
      this.syncCalendarSelection();
      this.buildCalendarDays();
    } catch (error) {
      this.error = (error as Error).message || 'Could not load dashboard data.';
    } finally {
      this.loading = false;
    }
  }

  private buildClassEvents(events: CmsEvent[], bookings: DashboardBooking[]): DashboardClassEvent[] {
    const byKey = new Map<string, DashboardClassEvent>();

    for (const event of events) {
      if (!event.title || !event.startDate) {
        continue;
      }
      const key = this.eventKey(event.title, event.startDate);
      byKey.set(key, {
        id: event.id || key,
        title: event.title,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        attendees: []
      });
    }

    for (const booking of bookings) {
      if (!booking.eventTitle || !booking.eventStart) {
        continue;
      }
      const key = this.eventKey(booking.eventTitle, booking.eventStart);
      const existing = byKey.get(key);
      if (existing) {
        existing.attendees.push(booking);
        continue;
      }

      byKey.set(key, {
        id: key,
        title: booking.eventTitle,
        eventType: 'Class',
        startDate: booking.eventStart,
        attendees: [booking]
      });
    }

    return [...byKey.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  private buildCalendarDays(): void {
    const start = this.startOfMonth(this.calendarMonth);
    const firstWeekday = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - firstWeekday);

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + i);
      const iso = this.dateKey(current);
      const eventCount = this.classEvents.filter((event) => this.dateKey(new Date(event.startDate)) === iso).length;
      days.push({
        date: current,
        inCurrentMonth: current.getMonth() === this.calendarMonth.getMonth(),
        eventCount
      });
    }
    this.calendarDays = days;
  }

  private syncCalendarSelection(): void {
    const todayKey = this.dateKey(new Date());
    const hasToday = this.classEvents.some((event) => this.dateKey(new Date(event.startDate)) === todayKey);
    if (hasToday) {
      this.selectedDate = this.startOfDay(new Date());
      this.calendarMonth = this.startOfMonth(new Date());
      return;
    }

    if (this.classEvents.length > 0) {
      const firstClassDate = new Date(this.classEvents[0].startDate);
      this.selectedDate = this.startOfDay(firstClassDate);
      this.calendarMonth = this.startOfMonth(firstClassDate);
      return;
    }

    this.selectedDate = this.startOfDay(new Date());
    this.calendarMonth = this.startOfMonth(new Date());
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private dateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private eventKey(title: string, startDate: string): string {
    return `${title.trim().toLowerCase()}__${startDate}`;
  }
}
