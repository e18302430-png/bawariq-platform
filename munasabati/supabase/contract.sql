-- ═══════════════ عقد الحجز الإلكتروني ═══════════════
-- العميل يوقّع مرة وحدة: بعد التوقيع ما يقدر أحد غير الإدارة يغيّر بيانات العقد أو يحذفه.
create or replace function public.bookings_contract_guard() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if (old.data ? 'contract') and (new.data->'contract') is distinct from (old.data->'contract') then raise exception 'contract is signed and locked'; end if;
  end if;
  return new;
end $$;
drop trigger if exists bookings_contract_guard on public.bookings;
create trigger bookings_contract_guard before update on public.bookings for each row execute function public.bookings_contract_guard();
