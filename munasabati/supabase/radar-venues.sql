-- قسم مستقل للقاعات والفنادق في الرادار
alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads add constraint leads_kind_check check (kind in ('person','business','vendor','venue','signal'));
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
      case when it->>'kind' in ('person','business','vendor','venue','signal') then it->>'kind' else 'person' end,
      left(it->>'title', 220), left(it->>'summary', 700), left(it->>'source', 60),
      least(100, greatest(0, coalesce(case when it->>'score' ~ '^\d+$' then (it->>'score')::int end, 50))),
      left(it->>'reply', 700))
    on conflict (url) do nothing;
    if found then n := n + 1; end if;
  end loop;
  return n;
end $$;
update public.leads set kind = 'venue' where kind = 'vendor' and (title ~ '(قاعة|قصر|استراحة|فندق|منتجع)');
