-- ═══════════════ الطلبات تمر على الإدارة + حالات تذاكر الدعم ═══════════════
-- review: طلب العميل عند الإدارة للمراجعة. التاجر ما يقدر يقرأه أو يعدّله لين ترسله الإدارة (status = 'new').
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check check (status in ('review', 'new', 'quoted', 'confirmed', 'declined'));
alter table public.tickets drop constraint if exists tickets_status_check;
alter table public.tickets add constraint tickets_status_check check (status in ('open', 'answered', 'reopened', 'closed'));

drop policy if exists "read bookings" on public.bookings;
create policy "read bookings" on public.bookings for select
  using (client_id = auth.uid() or (public.owns_target(kind, target_id) and status <> 'review'));
drop policy if exists "client creates booking" on public.bookings;
create policy "client creates booking" on public.bookings for insert
  with check (client_id = auth.uid() and status in ('review', 'new'));
drop policy if exists "parties update booking" on public.bookings;
create policy "parties update booking" on public.bookings for update
  using (client_id = auth.uid() or (public.owns_target(kind, target_id) and status <> 'review'))
  with check (client_id = auth.uid() or (public.owns_target(kind, target_id) and status <> 'review'));
