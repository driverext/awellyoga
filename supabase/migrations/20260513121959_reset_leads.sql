create table if not exists public.reset_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'reset-landing-page',
  created_at timestamptz not null default now()
);

alter table public.reset_leads enable row level security;
