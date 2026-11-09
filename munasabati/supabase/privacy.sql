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
