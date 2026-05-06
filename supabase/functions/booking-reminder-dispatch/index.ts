import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {
  buildWhenLabel,
  DEFAULT_STUDIO_TIMEZONE,
  escapeHtml,
  formatDateTime,
  getInternalRecipients,
  sendEmailViaConfiguredProvider
} from '../_shared/email.ts';

type BookingRow = {
  id: string;
  sanity_event_id: string | null;
  event_title: string | null;
  event_type: string | null;
  instructor_name: string | null;
  event_start: string | null;
  event_end: string | null;
  event_location: string | null;
  stripe_customer_name: string | null;
  stripe_customer_email: string | null;
  booking_status: string | null;
};

type NotificationType = 'night_before' | 'hour_before';

type EventGroup = {
  eventId: string;
  title: string;
  eventType: string | null;
  instructorName: string | null;
  start: string;
  end: string | null;
  location: string | null;
  attendees: Array<{ name: string; email: string }>;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const expectedToken = (Deno.env.get('BOOKING_NOTIFICATION_CRON_TOKEN') || '').trim();
  const providedToken = (req.headers.get('x-cron-token') || '').trim();
  if (!expectedToken || providedToken !== expectedToken) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  try {
    const payload = await safeJson(req);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Missing Supabase environment variables.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const timezone = (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();

    if (payload?.mode === 'send-test') {
      const testRecipient = (payload?.recipientEmail || 'info@awellyoga.com').trim().toLowerCase();
      if (!testRecipient) {
        return json({ error: 'recipientEmail is required for send-test mode.' }, 400);
      }

      const sampleEvent: EventGroup = {
        eventId: 'test-class-123',
        title: 'Gentle Vinyasa Flow',
        eventType: 'Yoga Class',
        instructorName: 'Arieta Berisha Kirk',
        start: '2026-05-12T10:00:00-04:00',
        end: '2026-05-12T11:15:00-04:00',
        location: 'A-WELL Yoga Studio',
        attendees: [
          { name: 'Jane Student', email: 'jane@example.com' },
          { name: 'Maria Client', email: 'maria@example.com' },
          { name: 'Nicole Practice', email: 'nicole@example.com' }
        ]
      };

      await sendSampleBookingAlert(testRecipient, timezone);
      const nightBefore = buildRosterEmail(sampleEvent, 'night_before', timezone);
      const hourBefore = buildRosterEmail(sampleEvent, 'hour_before', timezone);

      await sendEmailViaConfiguredProvider({
        toEmail: testRecipient,
        subject: `[TEST] ${buildSubject(sampleEvent, 'night_before', timezone)}`,
        text: nightBefore.text,
        html: nightBefore.html
      });

      await sendEmailViaConfiguredProvider({
        toEmail: testRecipient,
        subject: `[TEST] ${buildSubject(sampleEvent, 'hour_before', timezone)}`,
        text: hourBefore.text,
        html: hourBefore.html
      });

      return json({
        ok: true,
        mode: 'send-test',
        sentTo: testRecipient,
        templates: ['booking_alert', 'night_before', 'hour_before']
      });
    }

    const now = new Date();
    const lookAheadEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const { data, error } = await admin
      .from('bookings')
      .select('id, sanity_event_id, event_title, event_type, instructor_name, event_start, event_end, event_location, stripe_customer_name, stripe_customer_email, booking_status')
      .eq('booking_status', 'paid')
      .gte('event_start', now.toISOString())
      .lte('event_start', lookAheadEnd.toISOString())
      .order('event_start', { ascending: true });

    if (error) {
      return json({ error: error.message }, 400);
    }

    const bookings = ((data || []) as BookingRow[]).filter(
      (row) => !!row.sanity_event_id && !!row.event_start && normalizeAsClass(row.event_type)
    );

    if (!bookings.length) {
      return json({ ok: true, sent: 0, scanned: 0 });
    }

    const groupedEvents = groupBookings(bookings);
    let sent = 0;

    for (const event of groupedEvents) {
      const localStart = new Date(event.start);
      const hoursUntilStart = (localStart.getTime() - now.getTime()) / (60 * 60 * 1000);
      const minutesUntilStart = (localStart.getTime() - now.getTime()) / (60 * 1000);

      const shouldSendNightBefore = isNightBeforeWindow(now, timezone) && isTomorrowInTimezone(event.start, timezone);
      const shouldSendHourBefore = minutesUntilStart > 45 && minutesUntilStart <= 75;

      if (shouldSendNightBefore) {
        sent += await sendReminderIfNeeded(admin, event, 'night_before', timezone);
      }

      if (shouldSendHourBefore && hoursUntilStart > 0) {
        sent += await sendReminderIfNeeded(admin, event, 'hour_before', timezone);
      }
    }

    return json({ ok: true, sent, scanned: groupedEvents.length });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

async function sendReminderIfNeeded(
  admin: ReturnType<typeof createClient>,
  event: EventGroup,
  notificationType: NotificationType,
  timezone: string
): Promise<number> {
  const recipients = getInternalRecipients(event.instructorName, event.eventType);
  if (!recipients.length) {
    return 0;
  }

  const subject = buildSubject(event, notificationType, timezone);
  const { text, html } = buildRosterEmail(event, notificationType, timezone);
  let sent = 0;

  for (const toEmail of recipients) {
    const { data: existingLog, error: logError } = await admin
      .schema('internal')
      .from('booking_notification_logs')
      .select('id')
      .eq('sanity_event_id', event.eventId)
      .eq('event_start', event.start)
      .eq('notification_type', notificationType)
      .eq('recipient_email', toEmail)
      .limit(1);

    if (logError) {
      throw new Error(logError.message);
    }

    if (existingLog && existingLog.length > 0) {
      continue;
    }

    await sendEmailViaConfiguredProvider({
      toEmail,
      subject,
      text,
      html
    });

    const { error: insertError } = await admin.schema('internal').from('booking_notification_logs').insert({
      sanity_event_id: event.eventId,
      event_start: event.start,
      notification_type: notificationType,
      recipient_email: toEmail
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    sent += 1;
  }

  return sent;
}

function buildSubject(event: EventGroup, notificationType: NotificationType, timezone: string): string {
  const startsAt = formatDateTime(event.start, timezone);
  const prefix = notificationType === 'night_before' ? 'Tomorrow' : 'Starts Soon';
  return `${prefix}: ${event.title}${event.instructorName ? ` with ${event.instructorName}` : ''} (${startsAt})`;
}

async function sendSampleBookingAlert(toEmail: string, timezone: string): Promise<void> {
  const eventTitle = 'Gentle Vinyasa Flow';
  const startsAt = formatDateTime('2026-05-12T10:00:00-04:00', timezone);
  const endsAt = formatDateTime('2026-05-12T11:15:00-04:00', timezone);
  const whenLabel = buildWhenLabel('', startsAt, endsAt);
  const subject = '[TEST] Class Booking: Gentle Vinyasa Flow (Jane Student)';
  const text = [
    'Class Booking paid.',
    '',
    'Booking ID: test-booking-123',
    'Customer: Jane Student',
    'Customer Email: jane@example.com',
    'Customer Phone: (321) 555-0134',
    `Event: ${eventTitle}`,
    `When: ${whenLabel}`,
    'Location: A-WELL Yoga Studio',
    'Amount: $25.00',
    `Received: ${new Date().toISOString()}`
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin:0 0 12px;">Class Booking Paid</h2>
      <p style="margin:0 0 6px;"><strong>Booking ID:</strong> test-booking-123</p>
      <p style="margin:0 0 6px;"><strong>Customer:</strong> Jane Student</p>
      <p style="margin:0 0 6px;"><strong>Customer Email:</strong> jane@example.com</p>
      <p style="margin:0 0 6px;"><strong>Customer Phone:</strong> (321) 555-0134</p>
      <p style="margin:0 0 6px;"><strong>Event:</strong> ${escapeHtml(eventTitle)}</p>
      <p style="margin:0 0 6px;"><strong>When:</strong> ${escapeHtml(whenLabel)}</p>
      <p style="margin:0 0 6px;"><strong>Location:</strong> A-WELL Yoga Studio</p>
      <p style="margin:0;"><strong>Amount:</strong> $25.00</p>
    </div>
  `;

  await sendEmailViaConfiguredProvider({
    toEmail,
    subject,
    text,
    html,
    replyTo: 'jane@example.com'
  });
}

function buildRosterEmail(event: EventGroup, notificationType: NotificationType, timezone: string) {
  const startsAt = formatDateTime(event.start, timezone);
  const endsAt = formatDateTime(event.end, timezone);
  const whenLabel = buildWhenLabel('', startsAt, endsAt);
  const location = event.location?.trim() || 'A-WELL Yoga';
  const heading = notificationType === 'night_before' ? 'Tomorrow\'s class update' : 'One-hour class update';
  const intro =
    notificationType === 'night_before'
      ? 'Here is the current roster for tomorrow.'
      : 'Here is the current roster for the class starting in about an hour.';

  const attendeesText = event.attendees
    .map((attendee, index) => `${index + 1}. ${attendee.name} — ${attendee.email}`)
    .join('\n');

  const attendeesHtml = event.attendees
    .map(
      (attendee) =>
        `<li style="margin:0 0 8px;"><strong>${escapeHtml(attendee.name)}</strong><br/><span style="color:#6b7280;">${escapeHtml(attendee.email)}</span></li>`
    )
    .join('');

  return {
    text: [
      heading,
      '',
      intro,
      '',
      `Class: ${event.title}`,
      event.instructorName ? `Teacher: ${event.instructorName}` : null,
      whenLabel ? `When: ${whenLabel}` : null,
      `Where: ${location}`,
      `Booked: ${event.attendees.length}`,
      '',
      'Roster:',
      attendeesText
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
        <h2 style="margin:0 0 12px;">${escapeHtml(heading)}</h2>
        <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>
        <div style="background:#fcf9f4;border:1px solid #eee3d8;border-radius:12px;padding:14px 16px;">
          <p style="margin:0 0 6px;"><strong>Class:</strong> ${escapeHtml(event.title)}</p>
          ${event.instructorName ? `<p style="margin:0 0 6px;"><strong>Teacher:</strong> ${escapeHtml(event.instructorName)}</p>` : ''}
          ${whenLabel ? `<p style="margin:0 0 6px;"><strong>When:</strong> ${escapeHtml(whenLabel)}</p>` : ''}
          <p style="margin:0 0 6px;"><strong>Where:</strong> ${escapeHtml(location)}</p>
          <p style="margin:0;"><strong>Booked:</strong> ${event.attendees.length}</p>
        </div>
        <h3 style="margin:18px 0 10px;">Roster</h3>
        <ol style="padding-left:20px;margin:0;">${attendeesHtml}</ol>
      </div>
    `
  };
}

function groupBookings(bookings: BookingRow[]): EventGroup[] {
  const byEvent = new Map<string, EventGroup>();

  for (const booking of bookings) {
    const eventId = booking.sanity_event_id || '';
    const eventStart = booking.event_start || '';
    const key = `${eventId}::${eventStart}`;
    if (!eventId || !eventStart) {
      continue;
    }

    if (!byEvent.has(key)) {
      byEvent.set(key, {
        eventId,
        title: booking.event_title || 'Untitled Class',
        eventType: booking.event_type,
        instructorName: booking.instructor_name,
        start: eventStart,
        end: booking.event_end || null,
        location: booking.event_location || null,
        attendees: []
      });
    }

    const group = byEvent.get(key)!;
    group.attendees.push({
      name: booking.stripe_customer_name?.trim() || 'Booked Student',
      email: booking.stripe_customer_email?.trim().toLowerCase() || 'Unknown email'
    });
  }

  return [...byEvent.values()];
}

function normalizeAsClass(value: string | null): boolean {
  return (value || '').trim().toLowerCase().includes('class');
}

function isNightBeforeWindow(now: Date, timezone: string): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0');
  return hour === 19 && minute < 15;
}

function isTomorrowInTimezone(isoString: string, timezone: string): boolean {
  const now = new Date();
  const todayKey = zonedDateKey(now, timezone);
  const tomorrowKey = zonedDateKey(new Date(now.getTime() + 24 * 60 * 60 * 1000), timezone);
  const eventKey = zonedDateKey(new Date(isoString), timezone);
  return eventKey !== todayKey && eventKey === tomorrowKey;
}

function zonedDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function safeJson(req: Request): Promise<Record<string, string> | null> {
  try {
    return (await req.json()) as Record<string, string>;
  } catch {
    return null;
  }
}
