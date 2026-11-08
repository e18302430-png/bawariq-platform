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
