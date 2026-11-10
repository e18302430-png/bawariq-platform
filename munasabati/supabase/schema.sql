-- ═══════════════════════════════════════════════════════════════
-- مناسبتي: مخطط قاعدة البيانات (Supabase / Postgres)
-- التشغيل: Supabase Dashboard ← SQL Editor ← الصق الملف وشغّله مرة واحدة.
-- كل جدول محمي بسياسات RLS: كل طرف يشوف ويعدل بياناته فقط.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ملفات المستخدمين (يُنشأ تلقائياً عند أول دخول بالجوال)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  phone text,
  name text,
  created_at timestamptz not null default now()
);

-- مساحة العميل: المناسبة والضيوف والميزانية والمهام (خاصة بصاحبها فقط)
create table if not exists public.client_spaces (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- الموردون (يملك كل مورد حساب واحد أو أكثر)
create table if not exists public.suppliers (
  id text primary key,
  owner_id uuid references auth.users on delete set null,
  data jsonb not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- منشآت الأفراح (القاعات داخل data.halls)
create table if not exists public.venues (
  id text primary key,
  owner_id uuid references auth.users on delete set null,
  data jsonb not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- طلبات الحجز وعروض الأسعار بين العميل والمورد أو القاعة
create table if not exists public.bookings (
  id text primary key,
  client_id uuid references auth.users on delete set null,
  kind text not null check (kind in ('supplier', 'venue')),
  target_id text not null,
  status text not null check (status in ('new', 'quoted', 'confirmed', 'declined')),
  event_date date not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_target_idx on public.bookings (kind, target_id);
create index if not exists bookings_client_idx on public.bookings (client_id);

-- ── إنشاء الملف الشخصي تلقائياً ──
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ── هل المستخدم يملك الجهة المستهدفة بالحجز؟ ──
create or replace function public.owns_target(k text, t text) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when k = 'supplier' then exists (select 1 from suppliers where id = t and owner_id = auth.uid())
    when k = 'venue' then exists (select 1 from venues where id = t and owner_id = auth.uid())
    else false end
$$;

-- ── سياسات الوصول (RLS) ──
alter table public.profiles enable row level security;
alter table public.client_spaces enable row level security;
alter table public.suppliers enable row level security;
alter table public.venues enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own space" on public.client_spaces;
create policy "own space" on public.client_spaces for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "read suppliers" on public.suppliers;
create policy "read suppliers" on public.suppliers for select using (published or owner_id = auth.uid());
drop policy if exists "write own supplier" on public.suppliers;
create policy "write own supplier" on public.suppliers for insert with check (owner_id = auth.uid());
drop policy if exists "update own supplier" on public.suppliers;
create policy "update own supplier" on public.suppliers for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "read venues" on public.venues;
create policy "read venues" on public.venues for select using (published or owner_id = auth.uid());
drop policy if exists "write own venue" on public.venues;
create policy "write own venue" on public.venues for insert with check (owner_id = auth.uid());
drop policy if exists "update own venue" on public.venues;
create policy "update own venue" on public.venues for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- الحجز يراه العميل صاحبه، والمورد أو صاحب القاعة المستهدف
drop policy if exists "read bookings" on public.bookings;
create policy "read bookings" on public.bookings for select using (client_id = auth.uid() or public.owns_target(kind, target_id));
drop policy if exists "client creates booking" on public.bookings;
create policy "client creates booking" on public.bookings for insert with check (client_id = auth.uid() and status = 'new');
drop policy if exists "parties update booking" on public.bookings;
create policy "parties update booking" on public.bookings for update using (client_id = auth.uid() or public.owns_target(kind, target_id));

-- الأيام المحجوزة تظهر لكل الناس (بدون بيانات العميل) لمنع الحجز المزدوج
create or replace view public.busy_days with (security_invoker = false) as
  select kind, target_id, data->>'hallId' as hall_id, event_date from public.bookings where status = 'confirmed';
grant select on public.busy_days to anon, authenticated;

-- ── التحديث اللحظي للطلبات ──
alter publication supabase_realtime add table public.bookings;

-- ── تخزين الصور: قراءة عامة، والرفع داخل مجلد المستخدم فقط ──
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists "media read" on storage.objects;
create policy "media read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media upload own folder" on storage.objects;
create policy "media upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "media delete own" on storage.objects;
create policy "media delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ═══════════════ الإدارة والدعم (إضافة) ═══════════════
alter table public.profiles add column if not exists role text not null default 'user' check (role in ('user', 'admin'));
alter table public.suppliers add column if not exists status text not null default 'active' check (status in ('active', 'suspended'));
alter table public.venues add column if not exists status text not null default 'active' check (status in ('active', 'suspended'));

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- الحسابات المعلّقة تختفي عن العامة، والإدارة ترى وتعدّل وتحذف كل شيء
drop policy if exists "read suppliers" on public.suppliers;
create policy "read suppliers" on public.suppliers for select using ((published and status = 'active') or owner_id = auth.uid() or public.is_admin());
drop policy if exists "read venues" on public.venues;
create policy "read venues" on public.venues for select using ((published and status = 'active') or owner_id = auth.uid() or public.is_admin());
drop policy if exists "admin manage suppliers" on public.suppliers;
create policy "admin manage suppliers" on public.suppliers for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage venues" on public.venues;
create policy "admin manage venues" on public.venues for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage bookings" on public.bookings;
create policy "admin manage bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());

-- تذاكر الدعم
create table if not exists public.tickets (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tickets enable row level security;
drop policy if exists "own tickets" on public.tickets;
create policy "own tickets" on public.tickets for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
alter publication supabase_realtime add table public.tickets;

-- إعدادات المنصة (الإعلان العام)
create table if not exists public.settings (key text primary key, value text);
alter table public.settings enable row level security;
drop policy if exists "read settings" on public.settings;
create policy "read settings" on public.settings for select using (true);
drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- لتعيين نفسك مديراً: أنشئ حسابك من Authentication ← Users ← Add user (بريد وكلمة مرور، وفعّل Auto Confirm)، ثم شغّل:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'بريدك@example.com');

-- ═══════════════ الإدارة وسيط فعلي: ترى وتعدّل وتحذف بيانات كل العملاء ═══════════════
drop policy if exists "admin manage spaces" on public.client_spaces;
create policy "admin manage spaces" on public.client_spaces for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
alter publication supabase_realtime add table public.client_spaces;

-- ═══════════════ شاشة المنسق عند الباب ═══════════════
-- العميل يرسل رابطاً فيه مفتاح سري (data.doorKey). المنسق يقرأ قائمة الدخول ويسجل الحضور بهذا المفتاح فقط،
-- بدون أي وصول لميزانية العميل أو طلباته. إلغاء الرابط من التطبيق يغيّر المفتاح فيتوقف القديم فوراً.
create or replace function public.door_load(k text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'title', data->'event'->>'title', 'date', data->'event'->>'date',
    'program', coalesce(data->'invite'->'program', '[]'::jsonb), 'live', coalesce((data->>'liveIndex')::int, 0),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('id', g->>'id', 'name', g->>'name', 'section', g->>'section', 'side', g->>'side',
      'count', (g->>'count')::int, 'code', g->>'code', 'status', g->>'status', 'checkedIn', coalesce((g->>'checkedIn')::boolean, false), 'vip', coalesce((g->>'vip')::boolean, false), 'phone', ''))
      from jsonb_array_elements(data->'guests') g), '[]'::jsonb))
  from client_spaces where length(k) >= 10 and data->>'doorKey' = k limit 1
$$;

create or replace function public.door_checkin(k text, c text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid; gs jsonb; g jsonb; i int; code text := upper(regexp_replace(trim(c), '^(.*#INVITE-|MNS-)', '', 'i'));
begin
  if length(k) < 10 then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  select user_id, data->'guests' into uid, gs from client_spaces where data->>'doorKey' = k limit 1 for update;
  if uid is null then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  for i in 0 .. coalesce(jsonb_array_length(gs), 0) - 1 loop
    g := gs->i;
    if upper(g->>'code') = code then
      if coalesce((g->>'checkedIn')::boolean, false) then return jsonb_build_object('ok', false, 'reason', 'already', 'guest', g); end if;
      if g->>'status' = 'no' then return jsonb_build_object('ok', false, 'reason', 'declined', 'guest', g); end if;
      g := g || jsonb_build_object('checkedIn', true, 'status', 'yes', 'checkedAt', (extract(epoch from now()) * 1000)::bigint);
      update client_spaces set data = jsonb_set(data, array['guests', i::text], g), updated_at = now() where user_id = uid;
      return jsonb_build_object('ok', true, 'guest', g);
    end if;
  end loop;
  return jsonb_build_object('ok', false, 'reason', 'unknown');
end $$;
grant execute on function public.door_load(text) to anon, authenticated;
grant execute on function public.door_checkin(text, text) to anon, authenticated;
-- ═══════════════ حسابات بالجوال وكلمة المرور + أدوات الإدارة ═══════════════
-- كل حساب بريده الداخلي 9665XXXXXXXX@munasabati.app (ما يُرسل له أي بريد). الإدارة فقط تقدر تعيد كلمة المرور أو تربط حساباً بصاحبه.
create or replace function public.phone_email(p_phone text) returns text
language sql immutable set search_path = public as $$
  select '966' || regexp_replace(regexp_replace(regexp_replace(p_phone, '\D', '', 'g'), '^(00)?966', ''), '^0', '') || '@munasabati.app'
$$;

create or replace function public.admin_set_password(p_phone text, p_password text) returns boolean
language plpgsql security definer set search_path = public, extensions, auth as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if length(coalesce(p_password, '')) < 6 then raise exception 'short password'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
   where email = public.phone_email(p_phone);
  return found;
end $$;

create or replace function public.admin_link_owner(p_kind text, p_id text, p_phone text) returns boolean
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select id into uid from auth.users where email = public.phone_email(p_phone) limit 1;
  if uid is null then return false; end if;
  if p_kind = 'venue' then update public.venues set owner_id = uid, updated_at = now() where id = p_id;
  elsif p_kind = 'supplier' then update public.suppliers set owner_id = uid, updated_at = now() where id = p_id;
  else return false; end if;
  return found;
end $$;

revoke all on function public.admin_set_password(text, text) from public, anon;
revoke all on function public.admin_link_owner(text, text, text) from public, anon;
grant execute on function public.admin_set_password(text, text) to authenticated;
grant execute on function public.admin_link_owner(text, text, text) to authenticated;
-- ═══════════════ دعوة الضيف عبر رابطه (بدون حساب) ═══════════════
-- يرى الضيف دعوته فقط: تصميمها وبرنامجها ومكانها واسمه هو. بدون أرقام جوالات ولا بقية الضيوف ولا ميزانية.
create or replace function public.invite_load(c text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'event', s.data->'event',
    'invite', s.data->'invite',
    'liveIndex', s.data->'liveIndex',
    'host', s.data->'profile'->>'name',
    'guest', (select (g - 'phone') || jsonb_build_object('phone', '') from jsonb_array_elements(s.data->'guests') g where upper(g->>'code') = upper(trim(c)) limit 1),
    'venue', (select jsonb_build_object('name', v.data->>'name', 'district', v.data->>'district', 'photos', v.data->'photos')
                from public.bookings b join public.venues v on v.id = b.target_id
               where b.client_id = s.user_id and b.kind = 'venue' and b.status = 'confirmed' order by b.updated_at desc limit 1)
  )
  from public.client_spaces s
  where length(trim(c)) >= 4 and exists (select 1 from jsonb_array_elements(s.data->'guests') g where upper(g->>'code') = upper(trim(c)))
  limit 1
$$;

create or replace function public.invite_rsvp(c text, st text, cnt int default null, dt text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid; gs jsonb; g jsonb; i int;
begin
  if st not in ('yes', 'no', 'pending') then raise exception 'bad status'; end if;
  select user_id, data->'guests' into uid, gs from public.client_spaces
   where length(trim(c)) >= 4 and exists (select 1 from jsonb_array_elements(data->'guests') x where upper(x->>'code') = upper(trim(c))) limit 1 for update;
  if uid is null then return null; end if;
  for i in 0 .. jsonb_array_length(gs) - 1 loop
    g := gs->i;
    if upper(g->>'code') = upper(trim(c)) then
      g := g || jsonb_build_object('status', st);
      if cnt is not null then g := g || jsonb_build_object('count', greatest(1, least(cnt, 20))); end if;
      if dt is not null then g := g || jsonb_build_object('diet', left(dt, 120)); end if;
      update public.client_spaces set data = jsonb_set(data, array['guests', i::text], g), updated_at = now() where user_id = uid;
      return (g - 'phone') || jsonb_build_object('phone', '');
    end if;
  end loop;
  return null;
end $$;
grant execute on function public.invite_load(text) to anon, authenticated;
grant execute on function public.invite_rsvp(text, text, int, text) to anon, authenticated;
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
-- طلب الدعم: الإغلاق والرد من الإدارة فقط (حماية على مستوى قاعدة البيانات، مو الواجهة بس)
create or replace function public.tickets_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    -- upsert على تذكرة موجودة يمر هنا أولاً، والتحقق الفعلي في التحديث
    if new.status <> 'open' and not exists (select 1 from public.tickets where id = new.id) then raise exception 'ticket must start open'; end if;
  elsif new.status is distinct from old.status and new.status in ('closed', 'answered') then
    raise exception 'only admin can close or answer a ticket';
  end if;
  return new;
end $$;
drop trigger if exists tickets_guard on public.tickets;
create trigger tickets_guard before insert or update on public.tickets for each row execute function public.tickets_guard();
-- ═══════════════ غرفة التنسيق ليلة المناسبة + ختم الليلة ═══════════════
-- رسائل بين صاحب المناسبة والإدارة والمنسق العام ومنسقي الأقسام. جدول مستقل حتى ما تتعارض مع حفظ بيانات العميل.
create table if not exists public.event_ops (
  id text primary key,
  owner uuid not null references auth.users on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists event_ops_owner_idx on public.event_ops (owner, created_at desc);
alter table public.event_ops enable row level security;
drop policy if exists "read ops" on public.event_ops;
create policy "read ops" on public.event_ops for select using (owner = auth.uid() or public.is_admin());
drop policy if exists "write ops" on public.event_ops;
create policy "write ops" on public.event_ops for insert with check ((owner = auth.uid() and data->>'from' = 'client') or public.is_admin());
drop policy if exists "admin delete ops" on public.event_ops;
create policy "admin delete ops" on public.event_ops for delete using (public.is_admin());
do $$ begin alter publication supabase_realtime add table public.event_ops; exception when others then null; end $$;

-- شاشة المنسق: نفس السابق + حالة ختم الليلة + آخر رسائل غرفة التنسيق
create or replace function public.door_load(k text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'title', s.data->'event'->>'title', 'date', s.data->'event'->>'date', 'endedAt', s.data->'event'->'endedAt',
    'program', coalesce(s.data->'invite'->'program', '[]'::jsonb), 'live', coalesce((s.data->>'liveIndex')::int, 0),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('id', g->>'id', 'name', g->>'name', 'section', g->>'section', 'side', g->>'side',
      'count', (g->>'count')::int, 'code', g->>'code', 'status', g->>'status', 'checkedIn', coalesce((g->>'checkedIn')::boolean, false), 'vip', coalesce((g->>'vip')::boolean, false), 'phone', ''))
      from jsonb_array_elements(s.data->'guests') g), '[]'::jsonb),
    'ops', coalesce((select jsonb_agg(o.data || jsonb_build_object('id', o.id) order by o.created_at)
      from (select id, data, created_at from public.event_ops where owner = s.user_id order by created_at desc limit 40) o), '[]'::jsonb))
  from public.client_spaces s where length(k) >= 10 and s.data->>'doorKey' = k limit 1
$$;

-- المنسق يرسل لغرفة التنسيق بمفتاح رابطه فقط
create or replace function public.door_post(k text, f text, t text, kd text default 'msg') returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if length(k) < 10 or f not in ('all', 'men', 'women') or kd not in ('msg', 'alert') or length(trim(coalesce(t, ''))) = 0 then return false; end if;
  select user_id into uid from public.client_spaces where data->>'doorKey' = k limit 1;
  if uid is null then return false; end if;
  insert into public.event_ops (id, owner, data) values ('op' || substr(md5(random()::text || clock_timestamp()::text), 1, 12), uid,
    jsonb_build_object('from', f, 'text', left(trim(t), 280), 'kind', kd, 'at', (extract(epoch from now()) * 1000)::bigint));
  return true;
end $$;
grant execute on function public.door_load(text) to anon, authenticated;
grant execute on function public.door_post(text, text, text, text) to anon, authenticated;
-- ═══════════════ رابط الدعوة القصير (/i/رمز): المنسق يقدر يمسح الرابط نفسه بعد ═══════════════
create or replace function public.door_checkin(k text, c text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid; gs jsonb; g jsonb; i int; code text := upper(regexp_replace(trim(c), '^(.*#INVITE-|.*/I/|MNS-)', '', 'i'));
begin
  if length(k) < 10 then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  select user_id, data->'guests' into uid, gs from client_spaces where data->>'doorKey' = k limit 1 for update;
  if uid is null then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  for i in 0 .. coalesce(jsonb_array_length(gs), 0) - 1 loop
    g := gs->i;
    if upper(g->>'code') = code then
      if coalesce((g->>'checkedIn')::boolean, false) then return jsonb_build_object('ok', false, 'reason', 'already', 'guest', g); end if;
      if g->>'status' = 'no' then return jsonb_build_object('ok', false, 'reason', 'declined', 'guest', g); end if;
      g := g || jsonb_build_object('checkedIn', true, 'status', 'yes', 'checkedAt', (extract(epoch from now()) * 1000)::bigint);
      update client_spaces set data = jsonb_set(data, array['guests', i::text], g), updated_at = now() where user_id = uid;
      return jsonb_build_object('ok', true, 'guest', g);
    end if;
  end loop;
  return jsonb_build_object('ok', false, 'reason', 'unknown');
end $$;

-- ═══════════════ حماية المنصة: كل طرف يشوف حقه بس ═══════════════
-- جوال العميل وسعر مناسبتي له: العميل والإدارة فقط (التاجر ما يقدر يقرأها حتى من قاعدة البيانات).
-- سعر التاجر الصافي: التاجر والإدارة فقط (العميل ما يشوفه).
create table if not exists public.booking_client (
  booking_id text primary key references public.bookings(id) on delete cascade,
  phone text,
  price numeric,
  updated_at timestamptz not null default now()
);
create table if not exists public.booking_net (
  booking_id text primary key references public.bookings(id) on delete cascade,
  net numeric,
  updated_at timestamptz not null default now()
);
alter table public.booking_client enable row level security;
alter table public.booking_net enable row level security;

drop policy if exists "client side" on public.booking_client;
create policy "client side" on public.booking_client for all
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.client_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.bookings b where b.id = booking_id and (b.client_id = auth.uid() or public.is_admin())));
drop policy if exists "vendor side" on public.booking_net;
create policy "vendor side" on public.booking_net for all
  using (exists (select 1 from public.bookings b where b.id = booking_id and (public.owns_target(b.kind, b.target_id) or public.is_admin())))
  with check (exists (select 1 from public.bookings b where b.id = booking_id and (public.owns_target(b.kind, b.target_id) or public.is_admin())));

-- سعر العميل يحدده التسعير التلقائي أو الإدارة فقط (العميل ما يقدر يغيّر سعره)
create or replace function public.booking_client_guard() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if (tg_op = 'INSERT' and new.price is not null) or (tg_op = 'UPDATE' and new.price is distinct from old.price) then
      raise exception 'only admin sets the client price';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists booking_client_guard on public.booking_client;
create trigger booking_client_guard before insert or update on public.booking_client for each row execute function public.booking_client_guard();

-- التسعير التلقائي: أول ما يرسل التاجر سعره الصافي، ينحسب سعر مناسبتي للعميل
create or replace function public.auto_client_price() returns trigger language plpgsql security definer set search_path = public as $$
declare p jsonb; fee numeric; minf numeric; auto boolean; price numeric;
begin
  select coalesce((select value::jsonb from settings where key = 'pricing'), '{}'::jsonb) into p;
  auto := coalesce((p->>'auto')::boolean, true);
  if not auto or new.net is null or new.net <= 0 then return new; end if;
  fee := coalesce((p->>'feePct')::numeric, 15); minf := coalesce((p->>'minFee')::numeric, 300);
  price := round(greatest(new.net * (1 + fee / 100), new.net + minf) / 10) * 10;
  insert into booking_client (booking_id, price, updated_at) values (new.booking_id, price, now())
    on conflict (booking_id) do update set price = excluded.price, updated_at = now();
  return new;
end $$;
drop trigger if exists auto_client_price on public.booking_net;
create trigger auto_client_price after insert or update of net on public.booking_net for each row execute function public.auto_client_price();

-- الدفع: العميل يقدر يقول «حوّلت»، لكن «استلمنا» و«حوّلنا للتاجر» من الإدارة فقط
create or replace function public.bookings_pay_guard() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if (new.data->'pay'->>'stage') = 'paid' and coalesce(old.data->'pay'->>'stage', '') <> 'paid' then raise exception 'only admin confirms payment'; end if;
    if (new.data->'pay'->>'payoutAt') is distinct from (old.data->'pay'->>'payoutAt') then raise exception 'only admin records payouts'; end if;
  end if;
  return new;
end $$;
drop trigger if exists bookings_pay_guard on public.bookings;
create trigger bookings_pay_guard before update on public.bookings for each row execute function public.bookings_pay_guard();

do $$ begin alter publication supabase_realtime add table public.booking_client; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.booking_net; exception when others then null; end $$;

-- نقل البيانات القديمة: الجوال وسعر العميل لجدول العميل، وسعر التاجر لجدول التاجر، ونشيلها من بيانات الطلب المشتركة
insert into public.booking_client (booking_id, phone, price)
  select id, nullif(data->>'phone', ''), coalesce((data->>'clientPrice')::numeric, (data->>'quote')::numeric) from public.bookings
  on conflict (booking_id) do update set phone = coalesce(excluded.phone, booking_client.phone), price = coalesce(booking_client.price, excluded.price);
insert into public.booking_net (booking_id, net)
  select id, (data->>'quote')::numeric from public.bookings where data ? 'quote'
  on conflict (booking_id) do nothing;
alter table public.bookings disable trigger bookings_pay_guard;
update public.bookings set data = data - 'phone' - 'quote' - 'clientPrice' where data ?| array['phone', 'quote', 'clientPrice'];
alter table public.bookings enable trigger bookings_pay_guard;

-- ═══════════════ حق المستخدم في حذف بياناته (نظام حماية البيانات الشخصية) ═══════════════
-- يحذف حساب المستخدم وبياناته الشخصية نهائياً. الطلبات مع التجار تبقى (لحقوق التاجر والمحاسبة)
-- لكن بدون اسم ولا جوال العميل.
create or replace function public.delete_my_account() returns boolean
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  delete from public.booking_client c using public.bookings b where b.id = c.booking_id and b.client_id = uid;
  update public.bookings set data = jsonb_set(data - 'phone', '{clientName}', '"عميل حذف حسابه"'), client_id = null where client_id = uid;
  delete from public.client_spaces where user_id = uid;
  delete from public.tickets where user_id = uid;
  delete from public.event_ops where owner = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
  return true;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

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
-- رادار العملاء: فرص يجمعها وكيل البحث اليومي، تظهر للإدارة فقط
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  found_at timestamptz not null default now(),
  posted_at date,
  occasion text not null default 'other' check (occasion in ('wedding','milka','grad','aqiqa','birthday','family','corp','other')),
  city text,
  kind text not null default 'person' check (kind in ('person','business','vendor','signal')),
  title text not null,
  summary text,
  source text,
  score int not null default 50 check (score between 0 and 100),
  reply text,
  status text not null default 'new' check (status in ('new','contacted','won','skip')),
  note text
);
alter table public.leads enable row level security;
drop policy if exists "admin leads" on public.leads;
create policy "admin leads" on public.leads for all using (public.is_admin()) with check (public.is_admin());

-- مفتاح الوكيل: جدول بدون أي سياسة = لا أحد يقرأه إلا الدوال الآمنة
create table if not exists public.radar_keys (k text primary key);
alter table public.radar_keys enable row level security;

create or replace function public.radar_add(p_key text, p_items jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; it jsonb; d text;
begin
  if p_key is null or not exists (select 1 from radar_keys where k = p_key) then raise exception 'not allowed'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 80 then raise exception 'bad items'; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    continue when coalesce(it->>'url','') !~ '^https?://' or coalesce(it->>'title','') = '';
    d := it->>'posted_at';
    insert into leads(url, posted_at, occasion, city, kind, title, summary, source, score, reply)
    values (
      left(it->>'url', 800),
      case when d ~ '^\d{4}-\d{2}-\d{2}$' then d::date end,
      case when it->>'occasion' in ('wedding','milka','grad','aqiqa','birthday','family','corp') then it->>'occasion' else 'other' end,
      left(it->>'city', 40),
      case when it->>'kind' in ('person','business','vendor','signal') then it->>'kind' else 'person' end,
      left(it->>'title', 220), left(it->>'summary', 700), left(it->>'source', 60),
      least(100, greatest(0, coalesce(case when it->>'score' ~ '^\d+$' then (it->>'score')::int end, 50))),
      left(it->>'reply', 700))
    on conflict (url) do nothing;
    if found then n := n + 1; end if;
  end loop;
  return n;
end $$;
revoke all on function public.radar_add(text, jsonb) from public;
grant execute on function public.radar_add(text, jsonb) to anon, authenticated;
-- مساعد المنصة: الزائر يطلب عرض بموافقته، ويوصل الإدارة في الرادار كفرصة جاهزة
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists meta jsonb;

create or replace function public.assistant_lead(p jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p->>'phone',''), '\D', '', 'g');
declare nm text := left(btrim(coalesce(p->>'name','')), 60);
declare oc text := case when p->>'occasion' in ('wedding','milka','grad','aqiqa','birthday','family','corp') then p->>'occasion' else 'other' end;
declare occ_ar text;
begin
  if ph ~ '^9665\d{8}$' then ph := '0' || substr(ph, 4); end if;
  if ph !~ '^05\d{8}$' then raise exception 'bad phone'; end if;
  if length(nm) < 2 then raise exception 'bad name'; end if;
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'no consent'; end if;
  -- نفس الرقم خلال ١٠ دقايق: لا نكرر
  if exists (select 1 from leads where phone = ph and found_at > now() - interval '10 minutes') then return true; end if;
  if (select count(*) from leads where source = 'مساعد المنصة' and found_at > now() - interval '1 minute') > 20 then raise exception 'busy'; end if;
  occ_ar := case oc when 'wedding' then 'زواج' when 'milka' then 'ملكة' when 'grad' then 'تخرج' when 'aqiqa' then 'عقيقة' when 'birthday' then 'عيد ميلاد' when 'family' then 'عزيمة' when 'corp' then 'مناسبة شركة' else 'مناسبة' end;
  insert into leads(url, occasion, city, kind, title, summary, source, score, reply, phone, meta, posted_at)
  values (
    'assistant://' || gen_random_uuid(), oc, left(p->>'city', 40), 'person',
    left('طلب عرض: ' || occ_ar || coalesce(' · ' || nullif(p->>'guests','') || ' ضيف', '') || coalesce(' · ' || nullif(p->>'city',''), ''), 220),
    left(concat_ws(' · ', 'الاسم: ' || nm, nullif('الموعد: ' || coalesce(p->>'when',''), 'الموعد: '), nullif('الأهم: ' || coalesce(p->>'priority',''), 'الأهم: '), nullif('التقدير: ' || coalesce(p->>'estimate',''), 'التقدير: ')), 700),
    'مساعد المنصة', 96,
    left('هلا ' || nm || '، معك مناسبتي 🤍 وصلنا طلبك لـ' || occ_ar || '، وحابين نرتب لك عرض واضح اليوم. متى يناسبك نتكلم؟', 700),
    ph, jsonb_strip_nulls(jsonb_build_object('name', nm, 'when', p->>'when', 'guests', p->>'guests', 'priority', p->>'priority', 'estimate', p->>'estimate')),
    current_date);
  return true;
end $$;
revoke all on function public.assistant_lead(jsonb) from public;
grant execute on function public.assistant_lead(jsonb) to anon, authenticated;
-- النسبة بشقين: على العميل (feePct) وعلى المورد (vendorPct)، ولكل مرحلة في الجدول نسبتها
-- مثال الإطلاق: ١٠٪ على العميل أول شهرين، ١٥٪ شهرين، وبعدها ٨٪ على العميل + ١٠٪ من سعر المورد
alter table public.booking_net add column if not exists payout numeric;

create or replace function public.pricing_step(kind text) returns numeric
language plpgsql stable security definer set search_path = public as $$
declare p jsonb; v numeric;
begin
  select coalesce((select value::jsonb from settings where key = 'pricing'), '{}'::jsonb) into p;
  select (st->>kind)::numeric into v from jsonb_array_elements(coalesce(p->'steps', '[]'::jsonb)) st
    where (st->>'from')::date <= (now() at time zone 'Asia/Riyadh')::date order by (st->>'from')::date desc limit 1;
  if kind = 'feePct' then return coalesce(v, (p->>'feePct')::numeric, 15); end if;
  return coalesce(v, (p->>'vendorPct')::numeric, 0);
end $$;

-- حق المورد يتثبت لحظة ما يرسل سعره (بنسبة ذاك اليوم)
create or replace function public.net_payout() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.net is null or new.net <= 0 then new.payout := null; return new; end if;
  if tg_op = 'UPDATE' and new.net is not distinct from old.net and old.payout is not null then new.payout := old.payout; return new; end if;
  new.payout := round(new.net * (1 - public.pricing_step('vendorPct') / 100) / 10) * 10;
  return new;
end $$;
drop trigger if exists net_payout on public.booking_net;
create trigger net_payout before insert or update on public.booking_net for each row execute function public.net_payout();

create or replace function public.auto_client_price() returns trigger language plpgsql security definer set search_path = public as $$
declare p jsonb; fee numeric; minf numeric; auto boolean; price numeric;
begin
  select coalesce((select value::jsonb from settings where key = 'pricing'), '{}'::jsonb) into p;
  auto := coalesce((p->>'auto')::boolean, true);
  if not auto or new.net is null or new.net <= 0 then return new; end if;
  fee := public.pricing_step('feePct'); minf := coalesce((p->>'minFee')::numeric, 300);
  -- الحد الأدنى لربح مناسبتي يشمل اللي ينخصم من المورد
  price := round(greatest(new.net * (1 + fee / 100), new.net + greatest(0, minf - (new.net - coalesce(new.payout, new.net)))) / 10) * 10;
  insert into booking_client (booking_id, price, updated_at) values (new.booking_id, price, now())
    on conflict (booking_id) do update set price = excluded.price, updated_at = now();
  return new;
end $$;
