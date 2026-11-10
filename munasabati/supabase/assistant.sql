-- مساعد المنصة: الزائر يطلب عرض بموافقته، ويوصل الإدارة في الرادار كفرصة جاهزة
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists meta jsonb;

create or replace function public.assistant_lead(p jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p->>'phone',''), '\D', '', 'g');
declare nm text := left(btrim(coalesce(p->>'name','')), 60);
declare oc text := case when p->>'occasion' in ('wedding','milka','grad','aqiqa','birthday','family','corp') then p->>'occasion' else 'other' end;
declare occ_ar text;
begin
  if ph ~ '^9665\d{8}$' then ph := '0' || substr(ph, 4); end if;
  if ph !~ '^05\d{8}$' then raise exception 'bad phone'; end if;
  if length(nm) < 2 then raise exception 'bad name'; end if;
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'no consent'; end if;
  -- نفس الرقم خلال ١٠ دقايق: لا نكرر
  if exists (select 1 from leads where phone = ph and found_at > now() - interval '10 minutes') then return true; end if;
  if (select count(*) from leads where source = 'مساعد المنصة' and found_at > now() - interval '1 minute') > 20 then raise exception 'busy'; end if;
  occ_ar := case oc when 'wedding' then 'زواج' when 'milka' then 'ملكة' when 'grad' then 'تخرج' when 'aqiqa' then 'عقيقة' when 'birthday' then 'عيد ميلاد' when 'family' then 'عزيمة' when 'corp' then 'مناسبة شركة' else 'مناسبة' end;
  insert into leads(url, occasion, city, kind, title, summary, source, score, reply, phone, meta, posted_at)
  values (
    'assistant://' || gen_random_uuid(), oc, left(p->>'city', 40), 'person',
    left('طلب عرض: ' || occ_ar || coalesce(' · ' || nullif(p->>'guests','') || ' ضيف', '') || coalesce(' · ' || nullif(p->>'city',''), ''), 220),
    left(concat_ws(' · ', 'الاسم: ' || nm, nullif('الموعد: ' || coalesce(p->>'when',''), 'الموعد: '), nullif('الأهم: ' || coalesce(p->>'priority',''), 'الأهم: '), nullif('التقدير: ' || coalesce(p->>'estimate',''), 'التقدير: ')), 700),
    'مساعد المنصة', 96,
    left('هلا ' || nm || '، معك مناسبتي 🤍 وصلنا طلبك لـ' || occ_ar || '، وحابين نرتب لك عرض واضح اليوم. متى يناسبك نتكلم؟', 700),
    ph, jsonb_strip_nulls(jsonb_build_object('name', nm, 'when', p->>'when', 'guests', p->>'guests', 'priority', p->>'priority', 'estimate', p->>'estimate')),
    current_date);
  return true;
end $$;
revoke all on function public.assistant_lead(jsonb) from public;
grant execute on function public.assistant_lead(jsonb) to anon, authenticated;
