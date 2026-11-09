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
