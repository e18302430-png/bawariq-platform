-- ═══════════ استوديو مناسبتي (توليد صور بالذكاء الاصطناعي) ═══════════
-- شغّله مرة وحدة في Supabase → SQL Editor. آمن للتكرار.
-- القواعد: قوالب ثابتة فقط (بدون كتابة حرة)، بدون أشخاص أو وجوه، بدون رفع صور العملاء،
-- حد يومي لكل مستخدم + سقف يومي للمنصة كلها (مفتاح إيقاف)، وكل صورة معلَّمة «مولّدة بالذكاء الاصطناعي».

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  feature text not null check (feature in ('invite-art', 'decor')),
  preset jsonb not null default '{}'::jsonb,
  request_id text,
  url text,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  created_at timestamptz not null default now()
);
create index if not exists ai_generations_user_day on public.ai_generations (user_id, created_at desc);
alter table public.ai_generations enable row level security;
drop policy if exists "own ai generations" on public.ai_generations;
create policy "own ai generations" on public.ai_generations for select using (user_id = auth.uid() or public.is_admin());

-- السقف اليومي للمنصة (يتعدل من الإعدادات: key = 'studio', value = {"daily": 150, "perUser": 8, "on": true})
insert into public.settings (key, value) values ('studio', '{"daily":150,"perUser":8,"on":true}') on conflict (key) do nothing;

-- حجز محاولة توليد: يرجّع رقم السجل أو يرفض لو تعدّى الحد
create or replace function public.studio_claim(p_feature text, p_preset jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare cfg jsonb := coalesce((select value::jsonb from settings where key = 'studio'), '{}'::jsonb);
declare me uuid := auth.uid();
declare adm boolean := public.is_admin();
declare n_me int; n_all int; new_id uuid;
begin
  if me is null then raise exception 'login required'; end if;
  if coalesce((cfg->>'on')::boolean, true) is not true then raise exception 'studio off'; end if;
  if p_feature not in ('invite-art', 'decor') then raise exception 'bad feature'; end if;
  if p_feature = 'decor' and not adm then raise exception 'admin only'; end if;
  select count(*) into n_all from ai_generations where created_at > now() - interval '1 day';
  if n_all >= coalesce((cfg->>'daily')::int, 150) then raise exception 'daily cap'; end if;
  if not adm then
    select count(*) into n_me from ai_generations where user_id = me and created_at > now() - interval '1 day';
    if n_me >= coalesce((cfg->>'perUser')::int, 8) then raise exception 'user cap'; end if;
  end if;
  insert into ai_generations (user_id, feature, preset) values (me, p_feature, coalesce(p_preset, '{}'::jsonb)) returning id into new_id;
  return new_id;
end $$;

-- تحديث نتيجة التوليد (من دالة الخادم بتوكن نفس المستخدم)
create or replace function public.studio_done(p_id uuid, p_request text, p_url text, p_status text) returns void
language sql security definer set search_path = public as $$
  update ai_generations set request_id = coalesce(p_request, request_id), url = coalesce(p_url, url), status = coalesce(p_status, status)
  where id = p_id and user_id = auth.uid();
$$;

grant execute on function public.studio_claim(text, jsonb) to authenticated;
grant execute on function public.studio_done(uuid, text, text, text) to authenticated;
