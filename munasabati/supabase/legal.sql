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
