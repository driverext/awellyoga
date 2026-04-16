import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

interface PrivateSessionRequestPayload {
  name?: string;
  email?: string;
  phone?: string;
  goal?: string;
  availability?: string;
  notes?: string;
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey) {
      return json(req, { error: 'Missing Supabase environment variables.' }, 500);
    }

    const payload = (await req.json()) as PrivateSessionRequestPayload;
    const normalized = normalizePayload(payload);

    if (!normalized.name || normalized.name.length < 2) {
      return json(req, { error: 'Full name is required.' }, 400);
    }

    if (!isValidEmail(normalized.email)) {
      return json(req, { error: 'A valid email address is required.' }, 400);
    }

    if (!normalized.goal) {
      return json(req, { error: 'Session goal is required.' }, 400);
    }

    if (!normalized.availability) {
      return json(req, { error: 'Availability is required.' }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin
      .from('private_session_requests')
      .insert({
        name: normalized.name,
        email: normalized.email,
        phone: normalized.phone || null,
        goal: normalized.goal,
        availability: normalized.availability,
        notes: normalized.notes || null,
        source: normalized.source || 'schedule-page',
        status: 'new'
      })
      .select('id, status')
      .single();

    if (error) {
      return json(req, { error: error.message }, 400);
    }

    return json(req, {
      id: data?.id,
      status: data?.status || 'new',
      message: 'Private session request submitted.'
    });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function normalizePayload(payload: PrivateSessionRequestPayload) {
  return {
    name: (payload.name || '').trim(),
    email: (payload.email || '').trim().toLowerCase(),
    phone: (payload.phone || '').trim(),
    goal: (payload.goal || '').trim(),
    availability: (payload.availability || '').trim(),
    notes: (payload.notes || '').trim(),
    source: (payload.source || '').trim()
  };
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
