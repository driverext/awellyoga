create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table if exists public.bookings
  add column if not exists event_type text,
  add column if not exists instructor_name text;

create schema if not exists internal;

create table if not exists internal.booking_notification_logs (
  id uuid primary key default gen_random_uuid(),
  sanity_event_id text not null,
  event_start timestamptz not null,
  notification_type text not null check (notification_type in ('night_before', 'hour_before')),
  recipient_email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists booking_notification_logs_unique_event_recipient
  on internal.booking_notification_logs (sanity_event_id, event_start, notification_type, recipient_email);

do $$
begin
  if exists (select 1 from cron.job where jobname = 'booking-reminder-dispatch-every-15-minutes') then
    perform cron.unschedule('booking-reminder-dispatch-every-15-minutes');
  end if;
end
$$;

select cron.schedule(
  'booking-reminder-dispatch-every-15-minutes',
  '*/15 * * * *',
  $$
  select
    net.http_post(
      url := 'https://ytoxtyrpyknheaoqpnwk.supabase.co/functions/v1/booking-reminder-dispatch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-token', (select decrypted_secret from vault.decrypted_secrets where name = 'booking_notification_cron_token')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
