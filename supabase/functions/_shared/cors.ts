const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:4173',
  'http://awellyoga.com',
  'http://www.awellyoga.com',
  'https://awellyoga.com',
  'https://www.awellyoga.com'
];

function configuredOrigins(): string[] {
  const raw = Deno.env.get('ALLOWED_ORIGINS') || '';
  const parsed = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  // Keep safe defaults even when ALLOWED_ORIGINS is configured so live domain access
  // is not accidentally broken by a partial environment override.
  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...parsed]));
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
  return includesWildcard(allowedOrigins) || allowedOrigins.includes(origin) || isDynamicAllowedOrigin(origin);
}

export function resolveAllowedOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  const allowedOrigins = configuredOrigins();

  if (!origin) {
    return allowedOrigins[0] || null;
  }

  if (includesWildcard(allowedOrigins) || allowedOrigins.includes(origin) || isDynamicAllowedOrigin(origin)) {
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

function isDynamicAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();

    // Allow Vercel preview + production project domains.
    if (host.endsWith('.vercel.app')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
