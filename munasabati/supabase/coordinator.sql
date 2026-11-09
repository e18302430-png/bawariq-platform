-- ═══════════════ منسق مناسبتي: يتابع الموردين ليلة المناسبة ═══════════════
-- شاشة المنسق تشوف موردين المناسبة المؤكدين (الاسم والفئة وحالتهم فقط، بدون أسعار)، وتأكد وصولهم وجاهزيتهم.
create or replace function public.door_load(k text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'title', s.data->'event'->>'title', 'date', s.data->'event'->>'date', 'endedAt', s.data->'event'->'endedAt',
    'coordinator', s.data->'event'->'coordinator',
    'program', coalesce(s.data->'invite'->'program', '[]'::jsonb), 'live', coalesce((s.data->>'liveIndex')::int, 0),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('id', g->>'id', 'name', g->>'name', 'section', g->>'section', 'side', g->>'side',
      'count', (g->>'count')::int, 'code', g->>'code', 'status', g->>'status', 'checkedIn', coalesce((g->>'checkedIn')::boolean, false), 'vip', coalesce((g->>'vip')::boolean, false), 'phone', ''))
      from jsonb_array_elements(s.data->'guests') g), '[]'::jsonb),
    'vendors', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'kind', b.kind,
        'name', coalesce(v.data->>'name', su.data->>'name', ''), 'cat', b.data->>'cat',
        'vendorStatus', b.data->>'vendorStatus', 'check', b.data->'check') order by b.kind desc)
      from public.bookings b left join public.venues v on b.kind = 'venue' and v.id = b.target_id left join public.suppliers su on b.kind = 'supplier' and su.id = b.target_id
      where b.client_id = s.user_id and b.status = 'confirmed'), '[]'::jsonb),
    'ops', coalesce((select jsonb_agg(o.data || jsonb_build_object('id', o.id) order by o.created_at)
      from (select id, data, created_at from public.event_ops where owner = s.user_id order by created_at desc limit 40) o), '[]'::jsonb))
  from public.client_spaces s where length(k) >= 10 and s.data->>'doorKey' = k limit 1
$$;

create or replace function public.door_check(k text, bid text, st text, note text default null) returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid; nm text; lbl text;
begin
  if length(k) < 10 or st not in ('arrived', 'ready', 'issue') then return false; end if;
  select user_id into uid from public.client_spaces where data->>'doorKey' = k limit 1;
  if uid is null then return false; end if;
  update public.bookings b set data = b.data || jsonb_build_object('check', jsonb_build_object('state', st, 'note', nullif(left(trim(coalesce(note, '')), 200), ''), 'at', (extract(epoch from now()) * 1000)::bigint)), updated_at = now()
   where b.id = bid and b.client_id = uid and b.status = 'confirmed';
  if not found then return false; end if;
  select coalesce(v.data->>'name', su.data->>'name', 'المورد') into nm from public.bookings b
    left join public.venues v on b.kind = 'venue' and v.id = b.target_id left join public.suppliers su on b.kind = 'supplier' and su.id = b.target_id where b.id = bid;
  lbl := case st when 'arrived' then 'وصل' when 'ready' then 'جاهز' else 'فيه ملاحظة' end;
  insert into public.event_ops (id, owner, data) values ('op' || substr(md5(random()::text || clock_timestamp()::text), 1, 12), uid,
    jsonb_build_object('from', 'all', 'text', nm || ': ' || lbl || coalesce(' · ' || nullif(left(trim(coalesce(note, '')), 200), ''), ''), 'kind', case when st = 'issue' then 'alert' else 'msg' end, 'at', (extract(epoch from now()) * 1000)::bigint));
  return true;
end $$;
grant execute on function public.door_load(text) to anon, authenticated;
grant execute on function public.door_check(text, text, text, text) to anon, authenticated;

-- جدول النسبة: التسعير التلقائي يستخدم النسبة السارية اليوم (مثلاً ١٠٪ ثم ١٥٪ ثم ١٨٪)
create or replace function public.auto_client_price() returns trigger language plpgsql security definer set search_path = public as $$
declare p jsonb; fee numeric; minf numeric; auto boolean; price numeric;
begin
  select coalesce((select value::jsonb from settings where key = 'pricing'), '{}'::jsonb) into p;
  auto := coalesce((p->>'auto')::boolean, true);
  if not auto or new.net is null or new.net <= 0 then return new; end if;
  select (st->>'feePct')::numeric into fee from jsonb_array_elements(coalesce(p->'steps', '[]'::jsonb)) st
    where (st->>'from')::date <= (now() at time zone 'Asia/Riyadh')::date order by (st->>'from')::date desc limit 1;
  fee := coalesce(fee, (p->>'feePct')::numeric, 15); minf := coalesce((p->>'minFee')::numeric, 300);
  price := round(greatest(new.net * (1 + fee / 100), new.net + minf) / 10) * 10;
  insert into booking_client (booking_id, price, updated_at) values (new.booking_id, price, now())
    on conflict (booking_id) do update set price = excluded.price, updated_at = now();
  return new;
end $$;
