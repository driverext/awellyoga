export interface CmsInstructor {
  name: string;
  title: string;
  bioParagraphs: string[];
  imageUrl: string;
  photoAlt?: string;
  isFounder?: boolean;
  specialties?: string[];
}

export interface CmsAboutPageMeta {
  teamSectionHeading?: string;
  teamSectionSubheading?: string;
}

export interface CmsStudioHour {
  label: string;
  hours: string;
}

export interface CmsStudioPage {
  pageTitle?: string;
  pageSubtitle?: string;
  scheduleHeading?: string;
  scheduleBody?: string;
  scheduleButtonLabel?: string;
  scheduleButtonUrl?: string;
  scheduleNote?: string;
  scheduleImageUrl?: string;
  scheduleImageAlt?: string;
  singleVisitCheckoutUrl?: string;
  classPackCheckoutUrl?: string;
  membershipCheckoutUrl?: string;
  studioHours?: CmsStudioHour[];
}

export interface CmsAnnouncement {
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning';
  linkLabel?: string;
  linkUrl?: string;
}

export interface CmsEvent {
  id?: string;
  title: string;
  eventType: 'Yoga Class' | 'Workshop' | 'Retreat' | 'Special Event';
  instructorName?: string;
  instructorStripeAccountId?: string;
  startDate: string;
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
