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
