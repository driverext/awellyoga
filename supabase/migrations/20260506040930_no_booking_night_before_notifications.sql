alter table internal.booking_notification_logs
  drop constraint if exists booking_notification_logs_notification_type_check;

alter table internal.booking_notification_logs
  add constraint booking_notification_logs_notification_type_check
  check (notification_type in ('night_before', 'hour_before', 'no_bookings_night_before'));
