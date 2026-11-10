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
