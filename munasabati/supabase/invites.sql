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
