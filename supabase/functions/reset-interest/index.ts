import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';
import { escapeHtml, sendEmailViaConfiguredProvider } from '../_shared/email.ts';

interface ResetInterestPayload {
  email?: string;
  source?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) });
  }

  if (!isOriginAllowed(req)) {
    return json(req, { error: 'Origin not allowed.' }, 403);
  }

  if (req.method !== 'POST') {
    return json(req, { error: 'Method not allowed.' }, 405);
  }

  try {
    const payload = (await req.json()) as ResetInterestPayload;
    const email = (payload.email || '').trim().toLowerCase();
    const source = (payload.source || 'reset-landing-page').trim();

    if (!isValidEmail(email)) {
      return json(req, { error: 'A valid email address is required.' }, 400);
    }

    const supabaseUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
    const serviceRoleKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();
    if (!supabaseUrl || !serviceRoleKey) {
      return json(req, { error: 'Lead capture service is not configured.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error: insertError } = await admin
      .from('reset_leads')
      .upsert(
        {
          email,
          source
        },
        {
          onConflict: 'email'
        }
      );

    if (insertError) {
      return json(req, { error: insertError.message || 'Could not save this email yet.' }, 400);
    }

    await sendInternalResetLeadAlert(email, source);

    return json(req, { ok: true, message: 'Email saved.' });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

async function sendInternalResetLeadAlert(email: string, source: string): Promise<void> {
  const subject = 'New RESET QR lead';
  const text = [
    'A new RESET interest lead was captured.',
    '',
    `Email: ${email}`,
    `Source: ${source}`,
    `Submitted: ${new Date().toISOString()}`
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin:0 0 12px;">New RESET Lead</h2>
      <p style="margin:0 0 6px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 6px;"><strong>Source:</strong> ${escapeHtml(source)}</p>
      <p style="margin:0;"><strong>Submitted:</strong> ${escapeHtml(new Date().toISOString())}</p>
    </div>
  `;

  await sendEmailViaConfiguredProvider({
    toEmail: 'info@awellyoga.com',
    subject,
    text,
    html,
    replyTo: email
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json'
    }
  });
}
