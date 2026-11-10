-- رادار العملاء: فرص يجمعها وكيل البحث اليومي، تظهر للإدارة فقط
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  found_at timestamptz not null default now(),
  posted_at date,
  occasion text not null default 'other' check (occasion in ('wedding','milka','grad','aqiqa','birthday','family','corp','other')),
  city text,
  kind text not null default 'person' check (kind in ('person','business','vendor','signal')),
  title text not null,
  summary text,
  source text,
  score int not null default 50 check (score between 0 and 100),
  reply text,
  status text not null default 'new' check (status in ('new','contacted','won','skip')),
  note text
);
alter table public.leads enable row level security;
drop policy if exists "admin leads" on public.leads;
create policy "admin leads" on public.leads for all using (public.is_admin()) with check (public.is_admin());

-- مفتاح الوكيل: جدول بدون أي سياسة = لا أحد يقرأه إلا الدوال الآمنة
create table if not exists public.radar_keys (k text primary key);
alter table public.radar_keys enable row level security;

create or replace function public.radar_add(p_key text, p_items jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; it jsonb; d text;
begin
  if p_key is null or not exists (select 1 from radar_keys where k = p_key) then raise exception 'not allowed'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 80 then raise exception 'bad items'; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    continue when coalesce(it->>'url','') !~ '^https?://' or coalesce(it->>'title','') = '';
    d := it->>'posted_at';
    insert into leads(url, posted_at, occasion, city, kind, title, summary, source, score, reply)
    values (
      left(it->>'url', 800),
      case when d ~ '^\d{4}-\d{2}-\d{2}$' then d::date end,
      case when it->>'occasion' in ('wedding','milka','grad','aqiqa','birthday','family','corp') then it->>'occasion' else 'other' end,
      left(it->>'city', 40),
      case when it->>'kind' in ('person','business','vendor','signal') then it->>'kind' else 'person' end,
      left(it->>'title', 220), left(it->>'summary', 700), left(it->>'source', 60),
      least(100, greatest(0, coalesce(case when it->>'score' ~ '^\d+$' then (it->>'score')::int end, 50))),
      left(it->>'reply', 700))
    on conflict (url) do nothing;
    if found then n := n + 1; end if;
  end loop;
  return n;
end $$;
revoke all on function public.radar_add(text, jsonb) from public;
grant execute on function public.radar_add(text, jsonb) to anon, authenticated;
