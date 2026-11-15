-- ═══════════════ حماية الفوترة: الرصيد والاشتراك والباقة ما يرفعها إلا الإدارة ═══════════════
-- المورد يقدر ينقص رصيده (إرسال عرض) ويطلب شحن، بس ما يقدر يزيده. القاعة ما تغيّر حالة اشتراكها.
-- العميل يطلب ترقية باقة الدعوة، بس ما يفعّلها بنفسه.
create or replace function public.suppliers_wallet_guard() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      if coalesce((new.data->'wallet'->>'credits')::int, 5) > 5 then new.data := new.data - 'wallet'; end if;
      return new;
    end if;
    if coalesce((new.data->'wallet'->>'credits')::int, 5) > coalesce((old.data->'wallet'->>'credits')::int, 5) then
      raise exception 'only admin adds credits';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists suppliers_wallet_guard on public.suppliers;
create trigger suppliers_wallet_guard before insert or update on public.suppliers for each row execute function public.suppliers_wallet_guard();

create or replace function public.venues_sub_guard() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then new.data := new.data - 'sub'; return new; end if;
    if (new.data->'sub'->>'plan') is distinct from (old.data->'sub'->>'plan')
       or (new.data->'sub'->>'until') is distinct from (old.data->'sub'->>'until') then
      raise exception 'only admin changes subscriptions';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists venues_sub_guard on public.venues;
create trigger venues_sub_guard before insert or update on public.venues for each row execute function public.venues_sub_guard();

create or replace function public.client_tier_guard() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.data->'invite' ? 'tier' then new.data := jsonb_set(new.data, '{invite}', (new.data->'invite') - 'tier'); end if;
      return new;
    end if;
    if (new.data->'invite'->>'tier') is distinct from (old.data->'invite'->>'tier') then
      raise exception 'only admin activates invite tiers';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists client_tier_guard on public.client_spaces;
create trigger client_tier_guard before insert or update on public.client_spaces for each row execute function public.client_tier_guard();
