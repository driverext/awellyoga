create table if not exists public.private_session_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  goal text not null,
  availability text not null,
  notes text,
  source text,
  status text not null default 'new',
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists private_session_requests_status_idx
  on public.private_session_requests (status);

create index if not exists private_session_requests_created_at_idx
  on public.private_session_requests (created_at desc);

alter table public.private_session_requests enable row level security;
