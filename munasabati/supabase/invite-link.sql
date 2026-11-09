-- ═══════════════ رابط الدعوة القصير (/i/رمز): المنسق يقدر يمسح الرابط نفسه بعد ═══════════════
create or replace function public.door_checkin(k text, c text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid; gs jsonb; g jsonb; i int; code text := upper(regexp_replace(trim(c), '^(.*#INVITE-|.*/I/|MNS-)', '', 'i'));
begin
  if length(k) < 10 then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  select user_id, data->'guests' into uid, gs from client_spaces where data->>'doorKey' = k limit 1 for update;
  if uid is null then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  for i in 0 .. coalesce(jsonb_array_length(gs), 0) - 1 loop
    g := gs->i;
    if upper(g->>'code') = code then
      if coalesce((g->>'checkedIn')::boolean, false) then return jsonb_build_object('ok', false, 'reason', 'already', 'guest', g); end if;
      if g->>'status' = 'no' then return jsonb_build_object('ok', false, 'reason', 'declined', 'guest', g); end if;
      g := g || jsonb_build_object('checkedIn', true, 'status', 'yes', 'checkedAt', (extract(epoch from now()) * 1000)::bigint);
      update client_spaces set data = jsonb_set(data, array['guests', i::text], g), updated_at = now() where user_id = uid;
      return jsonb_build_object('ok', true, 'guest', g);
    end if;
  end loop;
  return jsonb_build_object('ok', false, 'reason', 'unknown');
end $$;
