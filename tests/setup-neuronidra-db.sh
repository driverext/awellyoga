#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Dedicated local test containers only; never connects to hosted Supabase.
network=awellyoga-neuronidra-tests
db=awellyoga-neuronidra-test-db
rest=awellyoga-neuronidra-test-rest
docker network inspect "$network" >/dev/null 2>&1 || docker network create "$network" >/dev/null
if ! docker inspect "$db" >/dev/null 2>&1; then
  docker run --name "$db" --network "$network" -e POSTGRES_PASSWORD=local-test-only -p 127.0.0.1:55432:5432 -d postgres:17-alpine >/dev/null
fi
for attempt in {1..30}; do
  if docker exec "$db" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 0.2
done
docker exec -i "$db" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
do $$ begin
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
grant service_role to postgres;
create schema if not exists auth;
create table if not exists auth.users(id uuid primary key);
create or replace function auth.uid() returns uuid language sql as 'select null::uuid';
SQL
for migration in 20260411_booking_auth 20260414_guest_booking_capacity 20260415_private_session_requests 20260416_booking_dashboard_customer_name 20260430033545_add_booking_whatsapp; do
  docker exec -i "$db" psql -U postgres -v ON_ERROR_STOP=1 < "supabase/migrations/$migration.sql" >/dev/null
done
# The production notification migration also installs Supabase-only cron extensions.
# Only its booking columns are needed for this plain PostgreSQL test fixture.
docker exec -i "$db" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
alter table public.bookings add column if not exists event_type text, add column if not exists instructor_name text;
grant usage on schema public to service_role;
grant all on public.bookings, public.private_session_requests to service_role;
SQL
docker exec -i "$db" psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/20261009000000_neuronidra_cash_capacity.sql >/dev/null
if ! docker inspect "$rest" >/dev/null 2>&1; then
  docker run --name "$rest" --network "$network" -p 127.0.0.1:55433:3000 \
    -e PGRST_DB_URI=postgres://postgres:local-test-only@awellyoga-neuronidra-test-db:5432/postgres \
    -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=service_role \
    -e PGRST_JWT_SECRET=neuronidra-isolated-tests-only-32-characters \
    -d postgrest/postgrest:v12.2.12 >/dev/null
fi
docker exec "$db" psql -U postgres -c "NOTIFY pgrst, 'reload schema';" >/dev/null
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:55433/bookings >/dev/null; then
    printf 'Isolated booking database ready on 127.0.0.1:55433\n'
    exit 0
  fi
  sleep 0.2
done
exit 1
