const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://awellyoga.com',
  'https://www.awellyoga.com'
];

function configuredOrigins(): string[] {
  const raw = Deno.env.get('ALLOWED_ORIGINS') || '';
  const parsed = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return parsed.length ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

function includesWildcard(origins: string[]): boolean {
  return origins.includes('*');
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) {
    return true;
  }

  const allowedOrigins = configuredOrigins();
  return includesWildcard(allowedOrigins) || allowedOrigins.includes(origin);
}

export function resolveAllowedOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  const allowedOrigins = configuredOrigins();

  if (!origin) {
    return allowedOrigins[0] || null;
  }

  if (includesWildcard(allowedOrigins) || allowedOrigins.includes(origin)) {
    return origin;
  }

  return null;
}

export function buildCorsHeaders(req: Request, methods = 'POST, OPTIONS'): Record<string, string> {
  const allowedOrigin = resolveAllowedOrigin(req);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': methods,
    Vary: 'Origin'
  };

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }

  return headers;
}
