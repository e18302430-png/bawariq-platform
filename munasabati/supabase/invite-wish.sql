-- ═══════════════ تهنئة الضيف مع ردّه ═══════════════
-- نفس invite_rsvp مع وسيط خامس اختياري (wsh): تهنئة قصيرة للعروسين تُحفظ في guest.wish.
create or replace function public.invite_rsvp(c text, st text, cnt int default null, dt text default null, wsh text default null) returns jsonb
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
      if wsh is not null and length(trim(wsh)) > 0 then g := g || jsonb_build_object('wish', left(trim(wsh), 280)); end if;
      update public.client_spaces set data = jsonb_set(data, array['guests', i::text], g), updated_at = now() where user_id = uid;
      return (g - 'phone') || jsonb_build_object('phone', '');
    end if;
  end loop;
  return null;
end $$;
-- الإصدار القديم (٤ وسائط) يتعارض مع الجديد في الاستدعاء بالأسماء، فنحذفه
drop function if exists public.invite_rsvp(text, text, int, text);
grant execute on function public.invite_rsvp(text, text, int, text, text) to anon, authenticated;
