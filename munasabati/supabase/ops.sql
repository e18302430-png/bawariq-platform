-- ═══════════════ غرفة التنسيق ليلة المناسبة + ختم الليلة ═══════════════
-- رسائل بين صاحب المناسبة والإدارة والمنسق العام ومنسقي الأقسام. جدول مستقل حتى ما تتعارض مع حفظ بيانات العميل.
create table if not exists public.event_ops (
  id text primary key,
  owner uuid not null references auth.users on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists event_ops_owner_idx on public.event_ops (owner, created_at desc);
alter table public.event_ops enable row level security;
drop policy if exists "read ops" on public.event_ops;
create policy "read ops" on public.event_ops for select using (owner = auth.uid() or public.is_admin());
drop policy if exists "write ops" on public.event_ops;
create policy "write ops" on public.event_ops for insert with check ((owner = auth.uid() and data->>'from' = 'client') or public.is_admin());
drop policy if exists "admin delete ops" on public.event_ops;
create policy "admin delete ops" on public.event_ops for delete using (public.is_admin());
do $$ begin alter publication supabase_realtime add table public.event_ops; exception when others then null; end $$;

-- شاشة المنسق: نفس السابق + حالة ختم الليلة + آخر رسائل غرفة التنسيق
create or replace function public.door_load(k text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'title', s.data->'event'->>'title', 'date', s.data->'event'->>'date', 'endedAt', s.data->'event'->'endedAt',
    'program', coalesce(s.data->'invite'->'program', '[]'::jsonb), 'live', coalesce((s.data->>'liveIndex')::int, 0),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('id', g->>'id', 'name', g->>'name', 'section', g->>'section', 'side', g->>'side',
      'count', (g->>'count')::int, 'code', g->>'code', 'status', g->>'status', 'checkedIn', coalesce((g->>'checkedIn')::boolean, false), 'vip', coalesce((g->>'vip')::boolean, false), 'phone', ''))
      from jsonb_array_elements(s.data->'guests') g), '[]'::jsonb),
    'ops', coalesce((select jsonb_agg(o.data || jsonb_build_object('id', o.id) order by o.created_at)
      from (select id, data, created_at from public.event_ops where owner = s.user_id order by created_at desc limit 40) o), '[]'::jsonb))
  from public.client_spaces s where length(k) >= 10 and s.data->>'doorKey' = k limit 1
$$;

-- المنسق يرسل لغرفة التنسيق بمفتاح رابطه فقط
create or replace function public.door_post(k text, f text, t text, kd text default 'msg') returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if length(k) < 10 or f not in ('all', 'men', 'women') or kd not in ('msg', 'alert') or length(trim(coalesce(t, ''))) = 0 then return false; end if;
  select user_id into uid from public.client_spaces where data->>'doorKey' = k limit 1;
  if uid is null then return false; end if;
  insert into public.event_ops (id, owner, data) values ('op' || substr(md5(random()::text || clock_timestamp()::text), 1, 12), uid,
    jsonb_build_object('from', f, 'text', left(trim(t), 280), 'kind', kd, 'at', (extract(epoch from now()) * 1000)::bigint));
  return true;
end $$;
grant execute on function public.door_load(text) to anon, authenticated;
grant execute on function public.door_post(text, text, text, text) to anon, authenticated;
