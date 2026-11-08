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

-- لتعيين نفسك مديراً بعد أول دخول برقم جوالك:
-- update public.profiles set role = 'admin' where phone = '9665XXXXXXXX';
