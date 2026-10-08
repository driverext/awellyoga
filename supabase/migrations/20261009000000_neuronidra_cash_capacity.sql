-- A shared, transactional cap for NeuroNidra card checkout holds and cash reservations.
-- Other events retain their current behavior.
create or replace function public.enforce_neuronidra_capacity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  active_count integer;
begin
  if new.sanity_event_id <> 'special-event-neuronidra-prishtina-2026-10-15' then
    return new;
  end if;

  -- Serialize admissions across all booking paths, including simultaneous requests.
  perform pg_advisory_xact_lock(hashtextextended(new.sanity_event_id, 0));
  if new.booking_status in ('paid', 'reserved') or
     (new.booking_status = 'pending' and new.reservation_expires_at > now()) then
    if tg_op = 'INSERT' and now() >= '2026-10-15T18:00:00+02:00'::timestamptz then
      raise exception using errcode = 'P0001', message = 'BOOKING_CLOSED';
    end if;
    if new.booking_status = 'reserved' and exists (
      select 1 from public.bookings b
      where b.sanity_event_id = new.sanity_event_id and b.id <> new.id
        and lower(b.stripe_customer_email) = lower(new.stripe_customer_email)
        and (b.booking_status in ('paid', 'reserved') or
             (b.booking_status = 'pending' and b.reservation_expires_at > now()))
    ) then
      raise exception using errcode = '23505', message = 'ALREADY_RESERVED';
    end if;
    select count(*) into active_count from public.bookings b
    where b.sanity_event_id = new.sanity_event_id and b.id <> new.id
      and (b.booking_status in ('paid', 'reserved') or
           (b.booking_status = 'pending' and b.reservation_expires_at > now()));
    if active_count >= 12 then
      raise exception using errcode = 'P0001', message = 'CLASS_FULL';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_neuronidra_capacity() from public;
drop trigger if exists enforce_neuronidra_capacity on public.bookings;
create trigger enforce_neuronidra_capacity
before insert or update on public.bookings
for each row execute function public.enforce_neuronidra_capacity();
