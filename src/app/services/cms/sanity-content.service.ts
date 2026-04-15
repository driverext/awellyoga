import { Injectable } from '@angular/core';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CmsAboutPageMeta,
  CmsAnnouncement,
  CmsEvent,
  CmsInstructor,
  CmsStudioPage
} from './cms.models';

interface RawInstructor {
  name?: string;
  title?: string;
  isFounder?: boolean;
  bio?: string;
  photo?: unknown;
  photoAlt?: string;
  specialties?: string[];
}

interface RawStudioPage {
  pageTitle?: string;
  pageSubtitle?: string;
  scheduleHeading?: string;
  scheduleBody?: string;
  scheduleButtonLabel?: string;
  scheduleButtonUrl?: string;
  scheduleNote?: string;
  scheduleImage?: unknown;
  scheduleImageAlt?: string;
  singleVisitCheckoutUrl?: string;
  classPackCheckoutUrl?: string;
  membershipCheckoutUrl?: string;
  studioHours?: Array<{ label?: string; hours?: string }>;
}

interface RawAnnouncement {
  title?: string;
  message?: string;
  level?: string;
  linkLabel?: string;
  linkUrl?: string;
}

interface RawEvent {
  _id?: string;
  title?: string;
  eventType?: string;
  instructor?: {
    name?: string;
    stripeConnectedAccountId?: string;
    acceptsPayouts?: boolean;
  };
  startDate?: string;
  endDate?: string;
  location?: string;
  summary?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bookingUrl?: string;
  stripePriceId?: string;
  priceLabel?: string;
  platformFeePercent?: number;
  maxSpots?: number;
  spotsBooked?: number;
}

@Injectable({ providedIn: 'root' })
export class SanityContentService {
  private readonly sanityConfig = environment.sanity;
  private readonly visualEditingEnabled = this.isVisualEditingEnabled();

  private readonly isEnabled =
    !!this.sanityConfig.projectId &&
    this.sanityConfig.projectId !== 'your-project-id' &&
    !!this.sanityConfig.dataset;

  private readonly client = this.isEnabled
    ? createClient({
        projectId: this.sanityConfig.projectId,
        dataset: this.sanityConfig.dataset,
        apiVersion: this.sanityConfig.apiVersion,
        useCdn: this.sanityConfig.useCdn,
        stega: {
          enabled: this.visualEditingEnabled,
          studioUrl: '/studio'
        }
      })
    : null;

  private readonly urlBuilder = this.client ? imageUrlBuilder(this.client) : null;

  getAboutPageMeta(): Observable<CmsAboutPageMeta | null> {
    if (!this.client) {
      return of(null);
    }

    const query = `*[_type == "aboutPage"][0]{teamSectionHeading, teamSectionSubheading}`;

    return from(this.client.fetch<CmsAboutPageMeta | null>(query)).pipe(
      catchError((error) => {
        console.error('Sanity getAboutPageMeta failed:', error);
        return of(null);
      })
    );
  }

  getInstructors(): Observable<CmsInstructor[]> {
    if (!this.client) {
      return of([]);
    }

    const query = `*[_type == "instructor" && isActive != false] | order(isFounder desc, displayOrder asc){
      name,
      title,
      isFounder,
      bio,
      photo,
      photoAlt,
      specialties
    }`;

    return from(this.client.fetch<RawInstructor[]>(query)).pipe(
      map((items) =>
        items
          .filter((item) => !!item.name && !!item.title)
          .map((item) => ({
            name: item.name || '',
            title: item.title || '',
            isFounder: !!item.isFounder,
            bioParagraphs: this.toParagraphs(item.bio),
            imageUrl: this.imageUrl(item.photo) || '/assets/Arieta_Bio.jpg',
            photoAlt: item.photoAlt || item.name || 'Instructor photo',
            specialties: item.specialties || []
          }))
      ),
      catchError((error) => {
        console.error('Sanity getInstructors failed:', error);
        return of([]);
      })
    );
  }

  getStudioPage(): Observable<CmsStudioPage | null> {
    if (!this.client) {
      return of(null);
    }

    const query = `*[_type == "studioPage"][0]{
      pageTitle,
      pageSubtitle,
      scheduleHeading,
      scheduleBody,
      scheduleButtonLabel,
      scheduleButtonUrl,
      scheduleNote,
      scheduleImage,
      scheduleImageAlt,
      singleVisitCheckoutUrl,
      classPackCheckoutUrl,
      membershipCheckoutUrl,
      studioHours[]{label, hours}
    }`;

    return from(this.client.fetch<RawStudioPage | null>(query)).pipe(
      map((doc) => {
        if (!doc) {
          return null;
        }

        return {
          pageTitle: doc.pageTitle,
          pageSubtitle: doc.pageSubtitle,
          scheduleHeading: doc.scheduleHeading,
          scheduleBody: doc.scheduleBody,
          scheduleButtonLabel: doc.scheduleButtonLabel,
          scheduleButtonUrl: doc.scheduleButtonUrl,
          scheduleNote: doc.scheduleNote,
          scheduleImageUrl: this.imageUrl(doc.scheduleImage) || undefined,
          scheduleImageAlt: doc.scheduleImageAlt,
          singleVisitCheckoutUrl: doc.singleVisitCheckoutUrl,
          classPackCheckoutUrl: doc.classPackCheckoutUrl,
          membershipCheckoutUrl: doc.membershipCheckoutUrl,
          studioHours: (doc.studioHours || []).filter((hour) => !!hour.label && !!hour.hours) as Array<{label: string; hours: string}>
        };
      }),
      catchError((error) => {
        console.error('Sanity getStudioPage failed:', error);
        return of(null);
      })
    );
  }

  getActiveAnnouncements(limit = 3): Observable<CmsAnnouncement[]> {
    if (!this.client) {
      return of([]);
    }

    const query = `*[_type == "announcement" && isActive == true && (!defined(startDate) || startDate <= now()) && (!defined(endDate) || endDate >= now())] | order(displayOrder asc, _createdAt desc)[0...$limit]{
      title,
      message,
      level,
      linkLabel,
      linkUrl
    }`;

    return from(this.client.fetch<RawAnnouncement[]>(query, { limit })).pipe(
      map((items) =>
        items
          .filter((item) => !!item.title && !!item.message)
          .map((item) => ({
            title: item.title || '',
            message: item.message || '',
            level: (item.level || 'info').toLowerCase() as 'info' | 'success' | 'warning',
            linkLabel: item.linkLabel,
            linkUrl: item.linkUrl
          }))
      ),
      catchError((error) => {
        console.error('Sanity getActiveAnnouncements failed:', error);
        return of([]);
      })
    );
  }

  getUpcomingEvents(limit = 40): Observable<CmsEvent[]> {
    if (!this.client) {
      return of([]);
    }

    const query = `*[_type == "retreatEvent" && isActive == true && defined(startDate) && coalesce(endDate, startDate) >= now()] | order(displayOrder asc, startDate asc)[0...$limit]{
      _id,
      title,
      eventType,
      instructor->{name, stripeConnectedAccountId, acceptsPayouts},
      startDate,
      endDate,
      location,
      summary,
      ctaLabel,
      ctaUrl,
      bookingUrl,
      stripePriceId,
      priceLabel,
      platformFeePercent,
      maxSpots,
      spotsBooked
    }`;

    return from(this.client.fetch<RawEvent[]>(query, { limit })).pipe(
      map((items) =>
        items
          .filter((item) => !!item.title && !!item.startDate)
          .map((item) => ({
            id: item._id,
            title: item.title || '',
            eventType: this.normalizeEventType(item.eventType),
            instructorName: item.instructor?.name,
            instructorStripeAccountId: item.instructor?.acceptsPayouts
              ? item.instructor?.stripeConnectedAccountId
              : undefined,
            startDate: item.startDate || '',
            endDate: item.endDate,
            location: item.location,
            summary: item.summary,
            ctaLabel: item.ctaLabel,
            ctaUrl: item.ctaUrl,
            bookingUrl: item.bookingUrl,
            stripePriceId: item.stripePriceId,
            priceLabel: item.priceLabel,
            platformFeePercent: this.toNumberOrUndefined(item.platformFeePercent),
            maxSpots: this.toNumberOrUndefined(item.maxSpots),
            spotsBooked: this.toNumberOrUndefined(item.spotsBooked)
          }))
      ),
      catchError((error) => {
        console.error('Sanity getUpcomingEvents failed:', error);
        return of([]);
      })
    );
  }

  private imageUrl(source: unknown, width = 1200): string | null {
    if (!source || !this.urlBuilder) {
      return null;
    }

    return this.urlBuilder.image(source as never).width(width).auto('format').url();
  }

  private toParagraphs(value?: string): string[] {
    if (!value) {
      return [];
    }

    return value
      .split(/\n\s*\n/)
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  private normalizeEventType(value?: string): CmsEvent['eventType'] {
    if (value === 'Yoga Class' || value === 'Workshop' || value === 'Retreat' || value === 'Special Event') {
      return value;
    }

    return 'Special Event';
  }

  private toNumberOrUndefined(value: unknown): number | undefined {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return undefined;
    }
    return value;
  }

  private isVisualEditingEnabled(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const search = new URLSearchParams(window.location.search);
    const hasPreviewParams =
      search.has('preview') ||
      search.has('perspective') ||
      search.has('sanity-preview-perspective') ||
      search.has('sanity-preview-secret') ||
      search.has('sanity-preview-pathname');

    if (hasPreviewParams) {
      return true;
    }

    if (window.self !== window.top) {
      try {
        const referrer = document.referrer ? new URL(document.referrer) : null;
        if (referrer && referrer.pathname.includes('/studio')) {
          return true;
        }
      } catch {
        return true;
      }
    }

    return false;
  }
}
