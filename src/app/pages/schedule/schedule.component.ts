import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CmsAnnouncement,
  CmsEvent,
  CmsStudioHour,
  CmsStudioPage
} from '../../services/cms/cms.models';
import { SanityContentService } from '../../services/cms/sanity-content.service';
import {
  BookingService,
  MemberBooking,
  MembershipStatus,
  PrivateSessionRequestPayload
} from '../../services/booking.service';
import { AuthService, AuthState } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { TrustedNavigationService } from '../../services/trusted-navigation.service';

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  iso: string;
  eventCount: number;
}

interface PrivateSessionFormModel {
  name: string;
  email: string;
  phone: string;
  preferredTeacher: string;
  goal: string;
  availability: string;
  notes: string;
}

type MembershipAuthMode = 'sign-in' | 'sign-up';
type MembershipAccountMode = MembershipAuthMode | 'reset-password';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  private readonly defaultClassCapacity = 6;

  pageTitle = 'Schedule';
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
  membershipAuthOpen = false;
  membershipAuthMode: MembershipAccountMode = 'sign-in';
  membershipAuthEmail = '';
  membershipAuthPassword = '';
  membershipAuthPasswordConfirm = '';
  membershipAuthLoading = false;
  membershipAuthError = '';
  membershipAuthNotice = '';
  membershipResetSending = false;
  memberBookingsLoading = false;
  memberBookingsError = '';
  memberBookings: MemberBooking[] = [];
  membershipStatusLoading = false;
  membershipStatusError = '';
  membershipStatus: MembershipStatus | null = null;
  membershipPortalLoading = false;
  authState: AuthState = {
    user: null,
    session: null,
    loading: true,
    lastEvent: null
  };
  privateSessionModalOpen = false;
  privateSessionCheckoutEvent: CmsEvent | null = null;
  privateSessionLoading = false;
  privateSessionError = '';
  privateSessionSuccess = '';
  privateSessionForm: PrivateSessionFormModel = {
    name: '',
    email: '',
    phone: '',
    preferredTeacher: '',
    goal: '',
    availability: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private cmsContent: SanityContentService,
    private bookingService: BookingService,
    private authService: AuthService,
    private seo: SeoService,
    private trustedNavigation: TrustedNavigationService
  ) {}

  ngOnInit(): void {
    this.updateSeo();
    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        if (params.get('membership') === 'success') {
          this.pricingFlowMessage =
            'Your membership checkout was successful. Sign in to your membership account and choose Use Membership to reserve your spot.';
        }
      })
    );

    this.subscriptions.add(
      this.authService.state$.subscribe((state) => {
        const previousEmail = this.authState.user?.email?.trim().toLowerCase() || '';
        this.authState = state;
        const nextEmail = state.user?.email?.trim().toLowerCase() || '';
        if (state.lastEvent === 'PASSWORD_RECOVERY') {
          this.openMembershipPasswordReset(nextEmail);
        }
        if (nextEmail && nextEmail !== previousEmail) {
          void this.loadMemberBookings();
          void this.loadMembershipStatus();
        }
        if (!nextEmail) {
          this.memberBookings = [];
          this.memberBookingsError = '';
          this.membershipStatus = null;
          this.membershipStatusError = '';
        }
      })
    );

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
      this.cmsContent.getUpcomingEvents().subscribe((events) => {
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
    if (this.isPrivateSessionEvent(event)) {
      this.privateSessionCheckoutEvent = event;
      this.privateSessionSuccess = '';
      this.privateSessionError = '';
      this.privateSessionModalOpen = true;
      return;
    }

    if (!this.canBookEvent(event)) {
      this.pricingFlowMessage = `Booking is missing for "${event.title}". Add a Stripe Price ID or booking URL in Sanity.`;
      return;
    }

    if (this.isEventFull(event)) {
      this.pricingFlowMessage = `${event.title} is full. Please choose another class date.`;
      return;
    }

    this.bookingEvent = event;
    this.bookingEmail = this.canUseMembership(event) ? '' : this.bookingEmail;
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

      if (result.url && this.trustedNavigation.redirectToTrustedUrl(result.url)) {
        return;
      }

      if (result.fallbackUrl) {
        const directUrl = this.buildBookingUrl(this.bookingEvent, email, result.fallbackUrl);
        if (directUrl && this.trustedNavigation.redirectToTrustedUrl(directUrl)) {
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

  bookPrivateSession(): void {
    this.privateSessionSuccess = '';
    this.privateSessionError = '';
    this.privateSessionCheckoutEvent = null;
    this.privateSessionModalOpen = true;
  }

  closePrivateSessionModal(): void {
    if (this.privateSessionLoading) {
      return;
    }

    this.privateSessionModalOpen = false;
    this.privateSessionError = '';
    this.privateSessionCheckoutEvent = null;
  }

  async submitPrivateSessionRequest(): Promise<void> {
    const payload = this.buildPrivateSessionPayload();
    if (!payload) {
      return;
    }

    this.privateSessionLoading = true;
    this.privateSessionError = '';

    try {
      const result = await this.bookingService.createPrivateSessionRequest(payload);
      if (!result.id) {
        this.privateSessionError = result.error || 'Could not submit your request. Please try again.';
        return;
      }

      if (this.privateSessionCheckoutEvent) {
        const checkoutResult = await this.bookingService.createCheckoutSession(
          this.privateSessionCheckoutEvent,
          payload.email,
          this.eventCapacity(this.privateSessionCheckoutEvent)
        );

        if (checkoutResult.url && this.trustedNavigation.redirectToTrustedUrl(checkoutResult.url)) {
          return;
        }

        if (checkoutResult.error) {
          this.privateSessionError = checkoutResult.error;
          return;
        }
      }

      this.privateSessionSuccess =
        'Thanks! Your private session request was received. We will contact you soon at the email you provided.';
      this.resetPrivateSessionForm();
      this.privateSessionModalOpen = false;
    } catch (error) {
      this.privateSessionError = (error as Error).message || 'Could not submit your request. Please try again.';
    } finally {
      this.privateSessionLoading = false;
    }
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

  async startMembershipCheckout(plan: 'intro' | 'standard'): Promise<void> {
    if (!this.isMembershipSignedIn()) {
      this.openMembershipAuth('sign-in');
      this.pricingFlowMessage = 'Please sign in or create an account before starting a membership.';
      return;
    }

    if (this.hasActiveMembership()) {
      this.pricingFlowMessage = 'Your account already has an active membership. You can use it when booking eligible classes.';
      return;
    }

    try {
      const result = await this.bookingService.createMembershipCheckout(plan);
      if (result.url && this.trustedNavigation.redirectToTrustedUrl(result.url)) {
        return;
      }

      this.pricingFlowMessage = result.error || 'Could not start membership checkout.';
    } catch (error) {
      this.pricingFlowMessage = (error as Error).message || 'Could not start membership checkout.';
    }
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
    this.studioHours = content.studioHours?.length ? content.studioHours : this.studioHours;
    this.updateSeo();
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

    if (this.isPrivateSessionEvent(event)) {
      return 'Request + Pay';
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
    const rawUrl = rawInputUrl || event.bookingUrl || event.ctaUrl || '';
    if (!rawUrl.trim()) {
      return null;
    }

    return this.trustedNavigation.buildTrustedBookingUrl(
      rawUrl,
      email,
      `${this.dateKey(this.selectedDate)}-${Date.now()}`
    );
  }

  private canBookEvent(event: CmsEvent): boolean {
    return !!event.stripePriceId || !!this.buildBookingUrl(event, 'placeholder@example.com');
  }

  canUseMembership(event: CmsEvent): boolean {
    return (
      event.eventType === 'Yoga Class' &&
      !this.isPrivateSessionEvent(event) &&
      (event.priceLabel || '').includes('$25')
    );
  }

  async reserveWithMembership(): Promise<void> {
    if (!this.bookingEvent) {
      return;
    }

    if (!this.isMembershipSignedIn()) {
      this.bookingError = 'Please sign in to the membership account you used for checkout.';
      this.openMembershipAuth('sign-in');
      return;
    }

    this.bookingLoading = true;
    this.bookingError = '';

    try {
      const result = await this.bookingService.createMemberReservation(
        this.bookingEvent,
        this.eventCapacity(this.bookingEvent)
      );

      this.closeBookingModal();
      this.pricingFlowMessage =
        result.message || 'Your member reservation is confirmed. We look forward to seeing you in class.';
    } catch (error) {
      this.bookingError =
        (error as Error).message ||
        'Could not reserve this class with membership. Please confirm you are signed into the correct membership account.';
    } finally {
      this.bookingLoading = false;
    }
  }

  isMembershipSignedIn(): boolean {
    return !!this.authState.user;
  }

  membershipEmail(): string {
    return this.authState.user?.email?.trim().toLowerCase() || '';
  }

  openMembershipAuth(mode: MembershipAuthMode = 'sign-in'): void {
    this.membershipAuthMode = mode;
    this.membershipAuthOpen = true;
    this.membershipAuthError = '';
    this.membershipAuthNotice = '';
    this.membershipAuthEmail = this.membershipEmail() || this.membershipAuthEmail;
    this.membershipAuthPassword = '';
    this.membershipAuthPasswordConfirm = '';
  }

  closeMembershipAuth(): void {
    if (this.membershipAuthLoading) {
      return;
    }

    this.membershipAuthOpen = false;
    this.membershipAuthError = '';
  }

  switchMembershipAuthMode(mode: MembershipAuthMode): void {
    this.membershipAuthMode = mode;
    this.membershipAuthError = '';
    this.membershipAuthNotice = '';
    this.membershipAuthPassword = '';
    this.membershipAuthPasswordConfirm = '';
  }

  async submitMembershipAuth(): Promise<void> {
    const email = this.membershipAuthEmail.trim().toLowerCase();
    const password = this.membershipAuthPassword;

    if (!this.isValidEmail(email)) {
      this.membershipAuthError = 'Please enter a valid email address.';
      return;
    }

    if (password.length < 8) {
      this.membershipAuthError = 'Please use a password with at least 8 characters.';
      return;
    }

    if (this.membershipAuthMode === 'reset-password') {
      if (password !== this.membershipAuthPasswordConfirm) {
        this.membershipAuthError = 'Your new password and confirmation need to match.';
        return;
      }
    }

    this.membershipAuthLoading = true;
    this.membershipAuthError = '';
    this.membershipAuthNotice = '';

    try {
      if (this.membershipAuthMode === 'sign-up') {
        const result = await this.authService.signUp(email, password);
        this.membershipAuthNotice = result.requiresEmailConfirmation
          ? 'Account created. Check your email to confirm your account, then sign in to use membership booking.'
          : 'Account created. You are now signed in.';
      } else if (this.membershipAuthMode === 'reset-password') {
        await this.authService.updatePassword(password);
        this.membershipAuthNotice = 'Password updated. You can keep booking with your membership account.';
      } else {
        await this.authService.signInWithPassword(email, password);
        this.membershipAuthNotice = 'You are signed in and ready to use membership booking.';
      }

      if (this.authService.currentUser) {
        this.membershipAuthOpen = false;
        this.pricingFlowMessage =
          this.membershipAuthMode === 'reset-password'
            ? `Password updated for ${this.membershipEmail()}. You can now start or use your membership.`
            : `Signed in as ${this.membershipEmail()}. You can now start or use your membership.`;
      }
    } catch (error) {
      this.membershipAuthError = (error as Error).message || 'Could not sign you in right now.';
    } finally {
      this.membershipAuthLoading = false;
    }
  }

  async signOutMembership(): Promise<void> {
    try {
      await this.authService.signOut();
      this.pricingFlowMessage = 'You have been signed out of your membership account.';
    } catch (error) {
      this.pricingFlowMessage = (error as Error).message || 'Could not sign out right now.';
    }
  }

  async sendMembershipReset(): Promise<void> {
    const email = this.membershipAuthEmail.trim().toLowerCase();
    if (!this.isValidEmail(email)) {
      this.membershipAuthError = 'Enter the email for your membership account first.';
      return;
    }

    this.membershipResetSending = true;
    this.membershipAuthError = '';
    this.membershipAuthNotice = '';

    try {
      await this.authService.resetPassword(email);
      this.membershipAuthNotice = 'Password reset email sent. Check your inbox and follow the link to update your password.';
    } catch (error) {
      this.membershipAuthError = (error as Error).message || 'Could not send a reset email right now.';
    } finally {
      this.membershipResetSending = false;
    }
  }

  async refreshMemberBookings(): Promise<void> {
    await this.loadMemberBookings();
  }

  async refreshMembershipStatus(): Promise<void> {
    await this.loadMembershipStatus();
  }

  async openMembershipPortal(): Promise<void> {
    if (!this.hasActiveMembership()) {
      this.pricingFlowMessage = 'Once your membership is active, you can manage it here.';
      return;
    }

    this.membershipPortalLoading = true;
    this.membershipStatusError = '';

    try {
      const result = await this.bookingService.createMembershipPortalSession();
      if (result.url && this.trustedNavigation.redirectToTrustedUrl(result.url)) {
        return;
      }

      this.membershipStatusError = result.error || 'Could not open membership management right now.';
    } catch (error) {
      this.membershipStatusError = (error as Error).message || 'Could not open membership management right now.';
    } finally {
      this.membershipPortalLoading = false;
    }
  }

  scrollToCalendar(): void {
    document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formatMemberBookingWhen(booking: MemberBooking): string {
    if (!booking.eventStart) {
      return 'Date TBD';
    }

    const start = new Date(booking.eventStart);
    if (Number.isNaN(start.getTime())) {
      return booking.eventStart;
    }

    const startLabel = start.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    if (!booking.eventEnd) {
      return startLabel;
    }

    const end = new Date(booking.eventEnd);
    if (Number.isNaN(end.getTime())) {
      return startLabel;
    }

    const endLabel = end.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return `${startLabel} - ${endLabel}`;
  }

  membershipStatusLabel(): string {
    if (!this.membershipStatus?.active) {
      return 'No active membership yet';
    }

    return this.membershipStatus.cancelAtPeriodEnd
      ? 'Active membership ending after current cycle'
      : 'Active membership';
  }

  membershipRenewsLabel(): string {
    const renewsAt = this.membershipStatus?.renewsAt;
    if (!renewsAt) {
      return '';
    }

    const renewsDate = new Date(renewsAt);
    if (Number.isNaN(renewsDate.getTime())) {
      return '';
    }

    const formatted = renewsDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return this.membershipStatus?.cancelAtPeriodEnd ? `Access ends ${formatted}` : `Renews ${formatted}`;
  }

  hasActiveMembership(): boolean {
    return !!this.membershipStatus?.active;
  }

  upcomingMemberBookingsCount(): number {
    const now = Date.now();
    return this.memberBookings.filter((booking) => {
      const start = booking.eventStart ? new Date(booking.eventStart).getTime() : Number.NaN;
      return Number.isFinite(start) && start >= now;
    }).length;
  }

  nextUpcomingMemberBooking(): MemberBooking | null {
    const now = Date.now();
    const upcoming = this.memberBookings
      .filter((booking) => {
        const start = booking.eventStart ? new Date(booking.eventStart).getTime() : Number.NaN;
        return Number.isFinite(start) && start >= now;
      })
      .sort((a, b) => {
        const aTime = a.eventStart ? new Date(a.eventStart).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.eventStart ? new Date(b.eventStart).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });

    return upcoming[0] || null;
  }

  nextUpcomingMemberBookingLabel(): string {
    const booking = this.nextUpcomingMemberBooking();
    if (!booking) {
      return 'No upcoming class yet';
    }

    return `${booking.eventTitle || 'Booked Class'} · ${this.formatMemberBookingWhen(booking)}`;
  }

  membershipNextStepLabel(): string {
    if (!this.isMembershipSignedIn()) {
      return 'Sign in or create your account to use membership booking.';
    }

    if (!this.hasActiveMembership()) {
      return 'Your account is ready. Start a membership below when you are ready.';
    }

    if (this.upcomingMemberBookingsCount() === 0) {
      return 'Your membership is active. Choose a class from the calendar and reserve your next spot.';
    }

    return 'Your membership is active and your upcoming classes are saved here.';
  }

  private isPrivateSessionEvent(event: CmsEvent): boolean {
    return /private session/i.test(event.title || '');
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

  private async loadMemberBookings(): Promise<void> {
    if (!this.isMembershipSignedIn()) {
      return;
    }

    this.memberBookingsLoading = true;
    this.memberBookingsError = '';

    try {
      this.memberBookings = await this.bookingService.getMyBookings(12);
    } catch (error) {
      this.memberBookingsError = (error as Error).message || 'Could not load your bookings right now.';
    } finally {
      this.memberBookingsLoading = false;
    }
  }

  private async loadMembershipStatus(): Promise<void> {
    if (!this.isMembershipSignedIn()) {
      return;
    }

    this.membershipStatusLoading = true;
    this.membershipStatusError = '';

    try {
      this.membershipStatus = await this.bookingService.getMembershipStatus();
    } catch (error) {
      this.membershipStatusError = (error as Error).message || 'Could not load your membership status right now.';
    } finally {
      this.membershipStatusLoading = false;
    }
  }

  private openMembershipPasswordReset(email: string): void {
    this.membershipAuthMode = 'reset-password';
    this.membershipAuthOpen = true;
    this.membershipAuthEmail = email || this.membershipAuthEmail;
    this.membershipAuthPassword = '';
    this.membershipAuthPasswordConfirm = '';
    this.membershipAuthError = '';
    this.membershipAuthNotice = 'Choose a new password for your membership account.';
  }

  private buildPrivateSessionPayload(): PrivateSessionRequestPayload | null {
    const name = this.privateSessionForm.name.trim();
    const email = this.privateSessionForm.email.trim().toLowerCase();
    const phone = this.privateSessionForm.phone.trim();
    const goal = this.privateSessionForm.goal.trim();
    const availability = this.privateSessionForm.availability.trim();
    const notes = this.privateSessionForm.notes.trim();

    if (!name || name.length < 2) {
      this.privateSessionError = 'Please enter your full name.';
      return null;
    }

    if (!this.isValidEmail(email)) {
      this.privateSessionError = 'Please enter a valid email address.';
      return null;
    }

    if (!this.privateSessionForm.preferredTeacher.trim()) {
      this.privateSessionError = 'Please choose who you would like to work with.';
      return null;
    }

    if (!goal) {
      this.privateSessionError = 'Please share your private session goals.';
      return null;
    }

    if (!availability) {
      this.privateSessionError = 'Please share your preferred days/times.';
      return null;
    }

    return {
      name,
      email,
      phone,
      preferredTeacher: this.privateSessionForm.preferredTeacher.trim(),
      goal,
      availability,
      notes: this.decoratePrivateSessionNotes(notes),
      source: this.privateSessionCheckoutEvent ? 'schedule-private-session-booking' : 'schedule-page'
    };
  }

  private resetPrivateSessionForm(): void {
    this.privateSessionForm = {
      name: '',
      email: '',
      phone: '',
      preferredTeacher: '',
      goal: '',
      availability: '',
      notes: ''
    };
  }

  private decoratePrivateSessionNotes(notes: string): string {
    const teacher = this.privateSessionForm.preferredTeacher.trim();
    if (!teacher) {
      return notes;
    }

    if (!notes) {
      return `Teacher preference: ${teacher}`;
    }

    return `Teacher preference: ${teacher}\n\n${notes}`;
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

  private updateSeo(): void {
    this.seo.updatePage({
      title: this.pageTitle || 'Schedule',
      description:
        'Browse upcoming yoga classes, workshops, private sessions, and live booking availability at A-WELL Yoga in Sanford, Florida.',
      path: '/schedule',
      image: this.scheduleImageUrl
    });
  }
}
