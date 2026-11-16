-- ═══════════ امتثال نظام حماية البيانات الشخصية (PDPL) ═══════════
-- شغّله مرة وحدة في Supabase → SQL Editor. آمن للتكرار.

-- ١) المساعد يحفظ وقت الموافقة، والموافقة التسويقية الاختيارية منفصلة
create or replace function public.assistant_lead(p jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p->>'phone',''), '\D', '', 'g');
declare nm text := left(btrim(coalesce(p->>'name','')), 60);
declare oc text := case when p->>'occasion' in ('wedding','milka','grad','aqiqa','birthday','family','corp') then p->>'occasion' else 'other' end;
declare via text := case when p->>'via' = 'invite' then 'invite' else 'site' end;
declare occ_ar text;
begin
  if ph ~ '^9665\d{8}$' then ph := '0' || substr(ph, 4); end if;
  if ph !~ '^05\d{8}$' then raise exception 'bad phone'; end if;
  if length(nm) < 2 then raise exception 'bad name'; end if;
  if coalesce((p->>'consent')::boolean, false) is not true then raise exception 'no consent'; end if;
  if exists (select 1 from leads where phone = ph and found_at > now() - interval '10 minutes') then return true; end if;
  if (select count(*) from leads where source like 'مساعد%' and found_at > now() - interval '1 minute') > 20 then raise exception 'busy'; end if;
  occ_ar := case oc when 'wedding' then 'زواج' when 'milka' then 'ملكة' when 'grad' then 'تخرج' when 'aqiqa' then 'عقيقة' when 'birthday' then 'عيد ميلاد' when 'family' then 'عزيمة' when 'corp' then 'مناسبة شركة' else 'مناسبة' end;
  insert into leads(url, occasion, city, kind, title, summary, source, score, reply, phone, meta, posted_at)
  values (
    'assistant://' || gen_random_uuid(), oc, left(p->>'city', 40), 'person',
    left('طلب عرض: ' || occ_ar || coalesce(' · ' || nullif(p->>'guests','') || ' ضيف', '') || coalesce(' · ' || nullif(p->>'city',''), ''), 220),
    left(concat_ws(' · ', 'الاسم: ' || nm, case when via = 'invite' then 'جاء من دعوة ضيف' end, nullif('الموعد: ' || coalesce(p->>'when',''), 'الموعد: '), nullif('الأهم: ' || coalesce(p->>'priority',''), 'الأهم: '), nullif('التقدير: ' || coalesce(p->>'estimate',''), 'التقدير: ')), 700),
    case when via = 'invite' then 'مساعد المنصة · دعوة' else 'مساعد المنصة' end, case when via = 'invite' then 97 else 96 end,
    left('هلا ' || nm || '، معك مناسبتي 🤍 وصلنا طلبك لـ' || occ_ar || '، وحابين نرتب لك عرض واضح اليوم. متى يناسبك نتكلم؟', 700),
    ph, jsonb_strip_nulls(jsonb_build_object('name', nm, 'via', via, 'when', p->>'when', 'guests', p->>'guests', 'priority', p->>'priority', 'estimate', p->>'estimate', 'consent_at', now(), 'marketing', coalesce((p->>'marketing')::boolean, false), 'marketing_at', case when coalesce((p->>'marketing')::boolean, false) then now() end)),
    current_date);
  return true;
end $$;

-- ٢) إلغاء الاشتراك التسويقي برقم الجوال (رابط إلغاء الاشتراك في أي رسالة تسويقية)
create or replace function public.marketing_unsubscribe(p_phone text) returns boolean
language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
begin
  if ph ~ '^9665\d{8}$' then ph := '0' || substr(ph, 4); end if;
  if ph !~ '^05\d{8}$' then return false; end if;
  update leads set meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object('marketing', false, 'unsubscribed_at', now()) where phone = ph;
  update auth.users set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('marketing_opt_in', false, 'marketing_unsub_at', now())
    where regexp_replace(coalesce(phone,''), '\D', '', 'g') in (ph, '966' || substr(ph, 2));
  return true;
end $$;
grant execute on function public.marketing_unsubscribe(text) to anon, authenticated;

-- ٣) فترات الاحتفاظ (مطابقة لسياسة الخصوصية) — دالة فقط، ما تشتغل لحالها
create or replace function public.munasabati_retention() returns jsonb
language plpgsql security definer set search_path = public as $$
declare n_guests int := 0; n_leads int := 0; n_tickets int := 0;
begin
  -- الضيوف: بعد ٩٠ يوم من المناسبة نمسح الأسماء والأرقام والملاحظات، ونخلي العدد والرد فقط
  with t as (
    select user_id from client_spaces
    where (data->'event'->>'date') ~ '^\d{4}-\d{2}-\d{2}$'
      and (data->'event'->>'date')::date < current_date - 90
      and exists (select 1 from jsonb_array_elements(coalesce(data->'guests','[]')) g where g->>'phone' <> '')
  )
  update client_spaces c set data = jsonb_set(c.data, '{guests}', (
      select coalesce(jsonb_agg((g - 'phone' - 'diet' - 'wish') || jsonb_build_object('name', 'ضيف', 'phone', '')), '[]')
      from jsonb_array_elements(c.data->'guests') g)), updated_at = now()
  from t where c.user_id = t.user_id;
  get diagnostics n_guests = row_count;

  -- طلبات المساعد والرادار للأفراد: ١٢ شهر
  delete from leads where kind = 'person' and found_at < now() - interval '12 months';
  get diagnostics n_leads = row_count;

  -- تذاكر الدعم المغلقة: سنتين
  delete from tickets where status = 'closed' and updated_at < now() - interval '2 years';
  get diagnostics n_tickets = row_count;

  -- الحجوزات والعقود والفواتير ما تنمسح هنا: تُحفظ ٥ سنوات وحسب متطلبات هيئة الزكاة والضريبة والجمارك.
  return jsonb_build_object('guests_spaces', n_guests, 'leads', n_leads, 'tickets', n_tickets, 'at', now());
end $$;
revoke all on function public.munasabati_retention() from public, anon, authenticated;

-- ٤) التشغيل التلقائي اليومي (٣:١٧ فجراً بتوقيت UTC) — بموافقة صاحب المنصة
-- لو طلع خطأ في pg_cron: فعّله من Database → Extensions → pg_cron ثم أعد تشغيل هذا الجزء
create extension if not exists pg_cron;
select cron.unschedule('munasabati-retention') where exists (select 1 from cron.job where jobname = 'munasabati-retention');
select cron.schedule('munasabati-retention', '17 3 * * *', $$select public.munasabati_retention()$$);
