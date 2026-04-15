alter table if exists public.bookings
  alter column user_id drop not null;

alter table if exists public.bookings
  alter column stripe_session_id drop not null;

alter table if exists public.bookings
  add column if not exists booking_status text not null default 'pending',
  add column if not exists reservation_expires_at timestamptz,
  add column if not exists cancelled_at timestamptz;

update public.bookings
set booking_status = case
  when coalesce(payment_status, '') in ('paid', 'succeeded') then 'paid'
  when coalesce(payment_status, '') in ('expired', 'canceled') then 'expired'
  else booking_status
end
where booking_status is distinct from case
  when coalesce(payment_status, '') in ('paid', 'succeeded') then 'paid'
  when coalesce(payment_status, '') in ('expired', 'canceled') then 'expired'
  else booking_status
end;

create index if not exists bookings_event_status_idx
  on public.bookings (sanity_event_id, booking_status);

create index if not exists bookings_reservation_expires_idx
  on public.bookings (reservation_expires_at);
