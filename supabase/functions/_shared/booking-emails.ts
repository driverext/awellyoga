import {
  buildWhenLabel, DEFAULT_STUDIO_TIMEZONE, escapeHtml, formatAmount,
  formatDateTime, getInternalRecipients, isValidEmail, normalizeEventType,
  sendEmailViaConfiguredProvider
} from './email.ts';
import { NEURONIDRA_EVENT, NEURONIDRA_CASH_NOTE } from '../../../shared/neuronidra-event.ts';

type ConfirmationEmailPayload = {
  toEmail: string;
  customerName: string;
  customerBackupContact?: string | null;
  eventType?: string | null;
  instructorName?: string | null;
  eventTitle: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  eventDateLabel?: string | null;
  eventLocation: string | null;
  amountTotal: number | null;
  currency: string | null;
  cashOnArrival?: boolean;
};

type InternalAlertPayload = ConfirmationEmailPayload & {
  bookingId: string;
};

export async function sendBookingConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {
  const timezone = payload.eventTitle === NEURONIDRA_EVENT.title ? 'Europe/Belgrade' : (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();

  const toEmail = payload.toEmail.trim().toLowerCase();
  if (!toEmail || !isValidEmail(toEmail)) {
    return;
  }

  const customerName = payload.customerName.trim() || 'there';
  const eventType = normalizeEventType(payload.eventType || payload.eventTitle);
  const eventTitle = payload.eventTitle?.trim() || 'your class';
  const startsAt = formatDateTime(payload.eventStart, timezone);
  const endsAt = formatDateTime(payload.eventEnd, timezone);
  const whenLabel = buildWhenLabel(payload.eventDateLabel, startsAt, endsAt);
  const location = payload.eventLocation?.trim() || 'A-WELL Yoga';
  const amountLabel = formatAmount(payload.amountTotal, payload.currency);

  const isYogaGlow = eventTitle.toLowerCase() === 'yoga glow';
  const isRetreat = eventType === 'retreat';
  const isWorkshop = eventType === 'workshop';
  const subject = `Booking Confirmed: ${eventTitle}`;
  let text = isYogaGlow
    ? [
        'You’re officially booked for Yoga Glow.',
        '',
        'We’ll meet by the ocean — not just for a class, but for an experience.',
        '',
        '⸻',
        '',
        'Event Details',
        '',
        '📍 Location: Flagler Avenue, New Smyrna Beach',
        'Meet at LUMA Caffè',
        '🕒 Time: 10:00 AM',
        '📅 Date: May 2nd, 2026',
        '',
        '⸻',
        '',
        'What to bring',
        '',
        'A towel or yoga mat',
        'Water',
        'Comfortable clothing you can move in',
        'An open mind (this one matters most)',
        '',
        '⸻',
        '',
        'I’ll provide the immersive headsets, so you can drop fully into the experience.',
        '',
        '⸻',
        '',
        'Take a breath before you arrive.',
        'Let the ocean do the rest.',
        '',
        '⸻',
        '',
        'I can’t wait to share this with you.',
        '',
        '—',
        'Arieta',
        'A-WELL YOGA 🤍'
      ].join('\n')
    : isRetreat
    ? [
        `Hi ${customerName},`,
        '',
        `Your retreat reservation is confirmed for ${eventTitle}.`,
        '',
        whenLabel ? `Dates: ${whenLabel}` : null,
        `Location: ${location}`,
        amountLabel ? `${payload.cashOnArrival ? 'Due on arrival' : 'Paid'}: ${amountLabel}` : null,
        '',
        'We will follow up by email with your retreat preparation details and any next steps.',
        'If you need anything before then, simply reply to this email.',
        '',
        'With warmth,',
        'A-WELL Yoga'
      ]
        .filter(Boolean)
        .join('\n')
    : isWorkshop
    ? [
        `Hi ${customerName},`,
        '',
        `You're confirmed for ${eventTitle}.`,
        '',
        whenLabel ? `When: ${whenLabel}` : null,
        `Where: ${location}`,
        amountLabel ? `${payload.cashOnArrival ? 'Due on arrival' : 'Paid'}: ${amountLabel}` : null,
        '',
        'We will send any workshop-specific details to this email address before the event.',
        '',
        'See you there,',
        'A-WELL Yoga'
      ]
        .filter(Boolean)
        .join('\n')
    : [
        `Hi ${customerName},`,
        '',
        `You're confirmed for ${eventTitle}.`,
        '',
        whenLabel ? `When: ${whenLabel}` : null,
        `Where: ${location}`,
        amountLabel ? `${payload.cashOnArrival ? 'Due on arrival' : 'Paid'}: ${amountLabel}` : null,
        '',
        'Please bring anything listed in the class description (mat, water, etc.).',
        'If you need to make changes, reply to this email.',
        '',
        'See you soon,',
        'A-WELL Yoga'
      ]
        .filter(Boolean)
        .join('\n');

  let html = isYogaGlow
    ? `
    <div style="margin:0;padding:24px;background:#f6f3ef;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e1d8;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#f7efe5 0%,#fff7ee 100%);border-bottom:1px solid #efe5d9;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#7d6651;">A-WELL YOGA</p>
          <h1 style="margin:0;font-size:26px;line-height:1.2;color:#3f2f24;">You&rsquo;re officially booked for Yoga Glow.</h1>
        </div>

        <div style="padding:24px 28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">We&rsquo;ll meet by the ocean &mdash; not just for a class, but for an experience.</p>

          <hr style="border:none;border-top:1px solid #efe5d9;margin:18px 0;" />

          <h2 style="margin:0 0 14px;font-size:18px;color:#4f3b2d;">Event Details</h2>
          <div style="background:#fcf9f4;border:1px solid #eee3d8;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.7;">
            <div>📍 <strong>Location:</strong> Flagler Avenue, New Smyrna Beach</div>
            <div>Meet at LUMA Caffè</div>
            <div>🕒 <strong>Time:</strong> 10:00 AM</div>
            <div>📅 <strong>Date:</strong> May 2nd, 2026</div>
          </div>

          <hr style="border:none;border-top:1px solid #efe5d9;margin:18px 0;" />

          <h2 style="margin:0 0 12px;font-size:18px;color:#4f3b2d;">What to bring</h2>
          <ul style="margin:0 0 4px 20px;padding:0;font-size:15px;line-height:1.7;">
            <li>A towel or yoga mat</li>
            <li>Water</li>
            <li>Comfortable clothing you can move in</li>
            <li>An open mind (this one matters most)</li>
          </ul>

          <hr style="border:none;border-top:1px solid #efe5d9;margin:18px 0;" />

          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">I&rsquo;ll provide the immersive headsets, so you can drop fully into the experience.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Take a breath before you arrive.<br/>Let the ocean do the rest.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">I can&rsquo;t wait to share this with you.</p>
          <p style="margin:0;font-size:15px;line-height:1.7;">&mdash;<br/>Arieta<br/>A-WELL YOGA 🤍</p>
        </div>
      </div>
    </div>
  `
    : isRetreat
    ? `
    <div style="margin:0;padding:24px;background:#f6f3ef;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e1d8;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#f1e2d3 0%,#fbf6ef 100%);border-bottom:1px solid #efe5d9;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#7d6651;">A-WELL YOGA RETREAT</p>
          <h1 style="margin:0;font-size:26px;line-height:1.2;color:#3f2f24;">Your retreat reservation is confirmed.</h1>
        </div>
        <div style="padding:24px 28px;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.7;">Hi ${escapeHtml(customerName)},</p>
          <p style="margin:0 0 14px;font-size:16px;line-height:1.7;">We saved your place for <strong>${escapeHtml(eventTitle)}</strong>.</p>
          <div style="background:#fcf9f4;border:1px solid #eee3d8;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.7;">
            ${whenLabel ? `<div><strong>Dates:</strong> ${escapeHtml(whenLabel)}</div>` : ''}
            <div><strong>Location:</strong> ${escapeHtml(location)}</div>
            ${amountLabel ? `<div><strong>Paid:</strong> ${escapeHtml(amountLabel)}</div>` : ''}
          </div>
          <p style="margin:18px 0 0;font-size:15px;line-height:1.7;">We will follow up with any preparation details and next steps by email.</p>
          <p style="margin:18px 0 0;font-size:15px;line-height:1.7;">With warmth,<br/>A-WELL Yoga</p>
        </div>
      </div>
    </div>
  `
    : isWorkshop
    ? `
    <div style="margin:0;padding:24px;background:#f6f3ef;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e1d8;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#f7efe5 0%,#fff7ee 100%);border-bottom:1px solid #efe5d9;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#7d6651;">A-WELL YOGA WORKSHOP</p>
          <h1 style="margin:0;font-size:26px;line-height:1.2;color:#3f2f24;">You&rsquo;re booked.</h1>
        </div>
        <div style="padding:24px 28px;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.7;">Hi ${escapeHtml(customerName)},</p>
          <p style="margin:0 0 14px;font-size:16px;line-height:1.7;">Your place is confirmed for <strong>${escapeHtml(eventTitle)}</strong>.</p>
          <p style="margin:0;font-size:15px;line-height:1.7;">${whenLabel ? `<strong>When:</strong> ${escapeHtml(whenLabel)}<br/>` : ''}<strong>Where:</strong> ${escapeHtml(location)}${amountLabel ? `<br/><strong>Paid:</strong> ${escapeHtml(amountLabel)}` : ''}</p>
          <p style="margin:18px 0 0;font-size:15px;line-height:1.7;">We&rsquo;ll email any workshop-specific details before the event.</p>
        </div>
      </div>
    </div>
  `
    : `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>You&apos;re confirmed for <strong>${escapeHtml(eventTitle)}</strong>.</p>
      <p>${whenLabel ? `<strong>When:</strong> ${escapeHtml(whenLabel)}<br/>` : ''}
      <strong>Where:</strong> ${escapeHtml(location)}${amountLabel ? `<br/><strong>Paid:</strong> ${escapeHtml(amountLabel)}` : ''}</p>
      <p>Please bring anything listed in the class description (mat, water, etc.).<br/>
      If you need to make changes, reply to this email.</p>
      <p>See you soon,<br/>A-WELL Yoga</p>
    </div>
  `;

  if (payload.cashOnArrival) {
    const note = `Unpaid — cash on arrival. ${NEURONIDRA_CASH_NOTE}`;
    text += `\n\n${note}`;
    html += `<p style="font-family:Arial,sans-serif;line-height:1.6;">${escapeHtml(note)}</p>`;
    html = html.replaceAll('<strong>Paid:</strong>', '<strong>Due on arrival:</strong>');
  }

  await sendEmailViaConfiguredProvider({
    toEmail,
    throwOnFailure: payload.cashOnArrival,
    subject,
    text,
    html
  });
}

export async function sendInternalBookingAlert(payload: InternalAlertPayload): Promise<void> {
  const timezone = payload.eventTitle === NEURONIDRA_EVENT.title ? 'Europe/Belgrade' : (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();
  const recipients = getInternalRecipients(payload.instructorName, payload.eventType);
  if (!recipients.length) {
    return;
  }

  const eventTitle = payload.eventTitle?.trim() || 'Untitled Event';
  const eventType = normalizeEventType(payload.eventType || payload.eventTitle);
  const startsAt = formatDateTime(payload.eventStart, timezone);
  const endsAt = formatDateTime(payload.eventEnd, timezone);
  const whenLabel = buildWhenLabel(payload.eventDateLabel, startsAt, endsAt);
  const location = payload.eventLocation?.trim() || 'A-WELL Yoga';
  const amountLabel = formatAmount(payload.amountTotal, payload.currency) || 'Unknown';
  const customerName = payload.customerName?.trim() || 'Unknown';
  const customerEmail = payload.toEmail?.trim().toLowerCase() || 'Unknown';
  const customerBackupContact = payload.customerBackupContact?.trim() || '';
  const backupContactLabel = eventType === 'retreat' ? 'Customer WhatsApp' : 'Customer Phone';

  const labelPrefix =
    eventType === 'retreat' ? 'Retreat Booking' : eventType === 'workshop' ? 'Workshop Booking' : 'Class Booking';
  const subject = `${labelPrefix}: ${eventTitle} (${customerName})`;
  const text = [
    payload.cashOnArrival ? `${labelPrefix}: Unpaid — cash on arrival. ${NEURONIDRA_CASH_NOTE}` : `${labelPrefix} paid.`,
    '',
    `Booking ID: ${payload.bookingId}`,
    `Customer: ${customerName}`,
    `Customer Email: ${customerEmail}`,
    customerBackupContact ? `${backupContactLabel}: ${customerBackupContact}` : null,
    `Event: ${eventTitle}`,
    whenLabel ? `When: ${whenLabel}` : null,
    `Location: ${location}`,
    `Amount: ${amountLabel}`,
    `Received: ${new Date().toISOString()}`
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin:0 0 12px;">${escapeHtml(labelPrefix)} ${payload.cashOnArrival ? 'Unpaid — cash on arrival' : 'Paid'}</h2>
      ${payload.cashOnArrival ? `<p>${escapeHtml(NEURONIDRA_CASH_NOTE)}</p>` : ''}
      <p style="margin:0 0 6px;"><strong>Booking ID:</strong> ${escapeHtml(payload.bookingId)}</p>
      <p style="margin:0 0 6px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin:0 0 6px;"><strong>Customer Email:</strong> ${escapeHtml(customerEmail)}</p>
      ${customerBackupContact ? `<p style="margin:0 0 6px;"><strong>${escapeHtml(backupContactLabel)}:</strong> ${escapeHtml(customerBackupContact)}</p>` : ''}
      <p style="margin:0 0 6px;"><strong>Event:</strong> ${escapeHtml(eventTitle)}</p>
      ${whenLabel ? `<p style="margin:0 0 6px;"><strong>When:</strong> ${escapeHtml(whenLabel)}</p>` : ''}
      <p style="margin:0 0 6px;"><strong>Location:</strong> ${escapeHtml(location)}</p>
      <p style="margin:0;"><strong>Amount:</strong> ${escapeHtml(amountLabel)}</p>
    </div>
  `;

  for (const toEmail of recipients) {
    await sendEmailViaConfiguredProvider({
      toEmail,
      throwOnFailure: payload.cashOnArrival,
      subject,
      text,
      html,
      replyTo: customerEmail !== 'Unknown' ? customerEmail : undefined
    });
  }
}
