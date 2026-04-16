alter table if exists public.bookings
  add column if not exists stripe_customer_name text;
