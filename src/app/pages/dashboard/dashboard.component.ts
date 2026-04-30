import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
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
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
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
  eventFilter = '';
  dateFilter = '';
  statusFilter = 'all';

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

  get filteredRecentBookings(): DashboardBooking[] {
    return this.recentBookings.filter((booking) => this.matchesBookingFilters(booking));
  }

  get filteredTopEvents(): DashboardEventSummary[] {
    const totals = new Map<string, DashboardEventSummary>();

    for (const booking of this.filteredRecentBookings) {
      if ((booking.bookingStatus || booking.paymentStatus || '').toLowerCase() !== 'paid') {
        continue;
      }

      const key = booking.eventTitle || 'Untitled Event';
      const current = totals.get(key) || { eventTitle: key, bookingsCount: 0, revenueCents: 0 };
      current.bookingsCount += 1;
      current.revenueCents += typeof booking.amountTotal === 'number' ? booking.amountTotal : 0;
      totals.set(key, current);
    }

    return [...totals.values()].sort((a, b) => b.revenueCents - a.revenueCents);
  }

  get uniqueEventTitles(): string[] {
    return [...new Set(this.classEvents.map((event) => event.title).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  money(cents: number | null | undefined): number {
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
    this.dateFilter = this.dateKey(day.date);
  }

  onDateFilterChange(): void {
    if (!this.dateFilter) {
      this.syncCalendarSelection();
      this.buildCalendarDays();
      return;
    }

    const [year, month, day] = this.dateFilter.split('-').map((value) => Number.parseInt(value, 10));
    if (!year || !month || !day) {
      return;
    }

    const nextDate = new Date(year, month - 1, day);
    this.selectedDate = this.startOfDay(nextDate);
    this.calendarMonth = this.startOfMonth(nextDate);
    this.buildCalendarDays();
  }

  clearFilters(): void {
    this.eventFilter = '';
    this.dateFilter = '';
    this.statusFilter = 'all';
    this.syncCalendarSelection();
    this.buildCalendarDays();
  }

  isSelected(day: CalendarDay): boolean {
    return this.dateKey(day.date) === this.dateKey(this.selectedDate);
  }

  selectedDateEvents(): DashboardClassEvent[] {
    const key = this.dateFilter || this.dateKey(this.selectedDate);
    return this.visibleClassEvents()
      .filter((event) => this.dateKey(new Date(event.startDate)) === key)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  selectedDateHeading(): string {
    const activeDate = this.dateFilter ? new Date(`${this.dateFilter}T12:00:00`) : this.selectedDate;
    return activeDate.toLocaleDateString(undefined, {
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
    return event.attendees.filter((booking) => (booking.bookingStatus || booking.paymentStatus) === 'paid');
  }

  pendingAttendees(event: DashboardClassEvent | null): DashboardBooking[] {
    if (!event) {
      return [];
    }
    return event.attendees.filter((booking) => booking.bookingStatus === 'pending' && booking.paymentStatus !== 'paid');
  }

  exportFilteredBookings(): void {
    const rows = this.filteredRecentBookings.map((booking) => ({
      created_at: booking.createdAt || '',
      event_title: booking.eventTitle || '',
      customer_name: booking.customerName || '',
      customer_email: booking.customerEmail || '',
      customer_whatsapp: booking.customerWhatsApp || '',
      amount: this.money(booking.amountTotal),
      currency: booking.currency || this.overview.currency || 'usd',
      status: booking.bookingStatus || booking.paymentStatus || ''
    }));

    this.downloadCsv(
      `awell-bookings-${this.dateStamp()}.csv`,
      ['created_at', 'event_title', 'customer_name', 'customer_email', 'customer_whatsapp', 'amount', 'currency', 'status'],
      rows
    );
  }

  exportAttendance(event: DashboardClassEvent | null = this.selectedAttendanceEvent): void {
    if (!event) {
      return;
    }

    const rows = event.attendees.map((attendee) => ({
      event_title: event.title,
      event_start: event.startDate,
      location: event.location || '',
      customer_name: attendee.customerName || '',
      customer_email: attendee.customerEmail || '',
      customer_whatsapp: attendee.customerWhatsApp || '',
      amount: this.money(attendee.amountTotal),
      currency: attendee.currency || this.overview.currency || 'usd',
      status: attendee.bookingStatus || attendee.paymentStatus || ''
    }));

    this.downloadCsv(
      `attendance-${this.slugify(event.title)}-${this.dateStamp()}.csv`,
      ['event_title', 'event_start', 'location', 'customer_name', 'customer_email', 'customer_whatsapp', 'amount', 'currency', 'status'],
      rows
    );
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

  buildCalendarDays(): void {
    const start = this.startOfMonth(this.calendarMonth);
    const firstWeekday = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - firstWeekday);
    const visibleEvents = this.visibleClassEvents();

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + i);
      const iso = this.dateKey(current);
      const eventCount = visibleEvents.filter((event) => this.dateKey(new Date(event.startDate)) === iso).length;
      days.push({
        date: current,
        inCurrentMonth: current.getMonth() === this.calendarMonth.getMonth(),
        eventCount
      });
    }
    this.calendarDays = days;
  }

  private syncCalendarSelection(): void {
    const events = this.visibleClassEvents();
    const todayKey = this.dateKey(new Date());
    const hasToday = events.some((event) => this.dateKey(new Date(event.startDate)) === todayKey);
    if (hasToday) {
      this.selectedDate = this.startOfDay(new Date());
      this.calendarMonth = this.startOfMonth(new Date());
      return;
    }

    if (events.length > 0) {
      const firstClassDate = new Date(events[0].startDate);
      this.selectedDate = this.startOfDay(firstClassDate);
      this.calendarMonth = this.startOfMonth(firstClassDate);
      return;
    }

    this.selectedDate = this.startOfDay(new Date());
    this.calendarMonth = this.startOfMonth(new Date());
  }

  private visibleClassEvents(): DashboardClassEvent[] {
    return this.classEvents.filter((event) => {
      if (this.eventFilter && event.title !== this.eventFilter) {
        return false;
      }
      if (this.dateFilter && this.dateKey(new Date(event.startDate)) !== this.dateFilter) {
        return false;
      }
      return true;
    });
  }

  private matchesBookingFilters(booking: DashboardBooking): boolean {
    if (this.eventFilter && booking.eventTitle !== this.eventFilter) {
      return false;
    }

    if (this.dateFilter) {
      const comparisonDate = booking.eventStart || booking.createdAt || '';
      if (!comparisonDate || this.dateKey(new Date(comparisonDate)) !== this.dateFilter) {
        return false;
      }
    }

    if (this.statusFilter !== 'all') {
      const status = (booking.bookingStatus || booking.paymentStatus || '').toLowerCase();
      if (status !== this.statusFilter) {
        return false;
      }
    }

    return true;
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

  private downloadCsv(filename: string, headers: string[], rows: Array<Record<string, string | number>>): void {
    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => this.csvCell(row[header] ?? '')).join(','))
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private csvCell(value: string | number): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  private slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event';
  }

  private dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
