import { describe, expect, it } from "vitest";
import {
  postOp, endEvent, reopenEvent, DEFAULT_THANKS, inviteTitle, inviteMessage, normCode, OCCASION_PROFILES, maskContacts, clientPriceFor, depositFor, sendQuote, claimPaid, confirmPaid, bookingMessage, acceptAgreement, hasAgreement,
  acceptQuote, busyDays, checkIn, createBooking, createEvent, createMemoryRepository, splitBudget, setTotalBudget, adminClients, adminUpdateClient, adminDeleteClient, adminUpdateBooking, normPhone, validPhone, enableDoor, suggestPlan, requestPlan, forwardToVendor, rejectRequest, openTicket, replyTicket, closeTicket, reopenTicket, learnPref, requestCancel, resolveCancel, reassignBooking, alternativesFor, updateEvent,
  hospitality, isWeekend, matchVenues, setBookingStatus, shiftDate, SEED_VENUES, hallPrice, journey, nextStage,
} from "./index";

describe("الحسابات", () => {
  it("حاسبة الضيافة: ذبيحة لكل 8 رجال و9 نساء", () => {
    const h = hospitality(80, 90);
    expect(h.sheep).toBe(20);
    expect(hospitality(80, 90, "buffet").sheep).toBe(10);
    expect(h.servers).toBe(4);
  });

  it("الميزانية يحددها العميل وتتوزع بالنسب", () => {
    const lines = splitBudget(100000);
    expect(lines.find((l) => l.cat === "venue")!.est).toBe(35000);
    expect(lines.reduce((a, l) => a + l.est, 0)).toBe(100000);
    expect(splitBudget(undefined).every((l) => l.est === 0)).toBe(true);
  });

  it("سعر نهاية الأسبوع للخميس والجمعة والسبت", () => {
    expect(isWeekend("2026-11-12")).toBe(true); // خميس
    expect(isWeekend("2026-11-10")).toBe(false); // ثلاثاء
    const h = { id: "a", name: "ق", weekdayPrice: 100, weekendPrice: 150 };
    expect(hallPrice(h, "2026-11-13")).toBe(150);
    expect(hallPrice({ id: "b", name: "بدون سعر" }, "2026-11-13")).toBeUndefined();
  });

  it("المطابقة تفضّل نفس المدينة، وتستبعد السعة الأصغر إذا أدخلها صاحب القاعة", () => {
    const [first] = matchVenues(SEED_VENUES, "جدة", 1000);
    expect(first.venue.city).toBe("جدة");
    const small = { ...SEED_VENUES[2], id: "x", halls: [{ id: "a", name: "صغيرة", menCap: 100, womenCap: 100 }] };
    const ranked = matchVenues([small, SEED_VENUES[2]], "جدة", 1000);
    expect(ranked[0].venue.id).toBe(SEED_VENUES[2].id);
  });

  it("إزاحة التاريخ", () => expect(shiftDate("2026-12-30", 3)).toBe("2027-01-02"));
});

describe("رحلة الحجز بين العميل والمورد", () => {
  it("طلب ← عرض سعر ← قبول يضيف المبلغ للميزانية ويقفل اليوم", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "عبدالله" }));
    const budgetBefore = repo.get().client.budget.length;
    repo.apply(createBooking({ kind: "supplier", targetId: "s1", clientName: "عبدالله", phone: "0550000000", occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, note: "", estimate: 24000, fromClient: true }));
    const id = repo.get().bookings[0].id;
    repo.apply(setBookingStatus(id, "quoted", { quote: 22000, message: { from: "provider", text: "حياكم" } }));
    repo.apply(acceptQuote(id, "بوارق"));
    const db = repo.get();
    expect(db.bookings[0].status).toBe("confirmed");
    expect(db.client.budget).toHaveLength(budgetBefore + 1);
    expect(db.client.budget.at(-1)?.est).toBe(22000);
    expect(busyDays("s1", db.bookings).has("2027-02-10")).toBe(true);
  });

  it("العميل يحدد ميزانيته ويعيد توزيعها", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "عبدالله" }));
    expect(repo.get().client.budget.every((l) => l.est === 0)).toBe(true);
    repo.apply(setTotalBudget(200000, true));
    const db = repo.get();
    expect(db.client.event!.budget).toBe(200000);
    expect(db.client.budget.find((l) => l.cat === "venue")!.est).toBe(64000);
  });
});

describe("بوابة الدخول", () => {
  it("يدخل الضيف مرة واحدة فقط ويرفض المعتذرين", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "عبدالله" }));
    const guests = repo.get().client.guests;
    const yes = guests.find((g) => g.status === "yes")!;
    const no = guests.find((g) => g.status === "no")!;
    const first = checkIn(repo.get(), `MNS-${yes.code}`);
    expect(first.result.ok).toBe(true);
    expect(checkIn(first.db, yes.code).result).toMatchObject({ ok: false, reason: "already" });
    expect(checkIn(first.db, no.code).result).toMatchObject({ ok: false, reason: "declined" });
    expect(checkIn(first.db, "ZZZZZ").result).toMatchObject({ ok: false, reason: "unknown" });
  });
});

describe("رحلة العميل", () => {
  const ev = { occasion: "wedding" as const, city: "الرياض", date: "2027-03-10", guests: 400, menRatio: 0.5, tier: "mid" as const, title: "زواج", hostName: "عبدالله" };
  it("بعد الخطة، الخطوة التالية هي اختيار القاعة", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent(ev));
    const st = journey(repo.get(), Date.parse("2026-11-08"));
    expect(st.map((s) => s.id)).toEqual(["plan", "venue", "prep", "invite", "day"]);
    expect(st[0].status).toBe("done");
    expect(nextStage(st, repo.get(), Date.parse("2026-11-08")).id).toBe("venue");
  });
  it("عرض سعر من القاعة يجعلها الخطوة النشطة، وقبوله يكملها", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent(ev));
    repo.apply(createBooking({ kind: "venue", targetId: "v1", hallId: "a", clientName: "ع", phone: "0550000000", occasion: "wedding", city: "الرياض", date: "2027-03-10", guests: 400, note: "", estimate: 50000, fromClient: true }));
    const id = repo.get().bookings[0].id;
    repo.apply(setBookingStatus(id, "quoted", { quote: 48000 }));
    expect(journey(repo.get())[1]).toMatchObject({ status: "active", cta: { route: "bookings" } });
    repo.apply(acceptQuote(id, "قصر الندى"));
    expect(journey(repo.get())[1].status).toBe("done");
  });
  it("مورد متكامل مؤكد يغطي كل الخدمات الأساسية", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent(ev));
    repo.apply(createBooking({ kind: "supplier", targetId: "s1", clientName: "ع", phone: "0550000000", occasion: "wedding", city: "الرياض", date: "2027-03-10", guests: 400, note: "", estimate: 24000, fromClient: true }));
    repo.apply(setBookingStatus(repo.get().bookings[0].id, "confirmed"));
    const prep = journey(repo.get())[2];
    expect(prep.status).toBe("done");
    expect(prep.checklist?.every((c) => c.state === "confirmed")).toBe(true);
  });
});

describe("الإدارة وسيط بين العميل والتجار", () => {
  it("ترى العميل ببياناته وطلباته، وتعدل وتحذف", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "سارة", phone: "0551112222", budget: 150000, samples: false }));
    repo.apply(createBooking({ kind: "venue", targetId: "v1", clientName: "سارة", phone: "+966551112222", occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, note: "", estimate: 0, fromClient: true, budget: 50000 }));
    let c = adminClients(repo.get()).find((x) => x.phone === "0551112222")!;
    expect(c.source).toBe("space");
    expect(c.budget).toBe(150000);
    expect(c.bookings).toHaveLength(1);
    repo.apply(adminUpdateClient(c, { name: "سارة محمد", event: { guests: 500 } }));
    expect(repo.get().bookings.find((b) => b.fromClient)!.clientName).toBe("سارة محمد");
    expect(repo.get().client.event!.guests).toBe(500);
    repo.apply(adminUpdateBooking(repo.get().bookings[0].id, { quote: 48000 }));
    expect(repo.get().bookings[0].quote).toBe(48000);
    c = adminClients(repo.get()).find((x) => x.phone === "0551112222")!;
    repo.apply(adminDeleteClient(c));
    expect(repo.get().client.event).toBeNull();
    expect(repo.get().bookings.some((b) => b.fromClient)).toBe(false);
  });

  it("يقبل أرقام الجوال بكل الصيغ", () => {
    expect(normPhone("+966 55 111 2222")).toBe("0551112222");
    expect(normPhone("551112222")).toBe("0551112222");
    expect(normPhone("٠٥٥١١١٢٢٢٢")).toBe("0551112222");
    expect(validPhone("0551112222")).toBe(true);
    expect(validPhone("12345")).toBe(false);
  });
});

describe("المنسق عند الباب", () => {
  it("رابط بمفتاح يتجدد، وضيف القسم الآخر يُوجَّه بدل تسجيله", () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 400, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "عبدالله" }));
    repo.apply(enableDoor());
    const k1 = repo.get().client.doorKey!;
    expect(k1).toHaveLength(12);
    repo.apply(enableDoor());
    expect(repo.get().client.doorKey).toBe(k1);
    repo.apply(enableDoor(true));
    expect(repo.get().client.doorKey).not.toBe(k1);
    const w = repo.get().client.guests.find((g) => g.section === "women" && g.status !== "no")!;
    const r1 = checkIn(repo.get(), w.code, "men");
    expect(r1.result.ok).toBe(false);
    expect(!r1.result.ok && r1.result.reason).toBe("section");
    const r2 = checkIn(repo.get(), "https://x.com/client/#invite-" + w.code.toLowerCase(), "women");
    expect(r2.result.ok).toBe(true);
  });
});

describe("الخطة المقترحة وحماية العميل", () => {
  const setup = () => {
    const repo = createMemoryRepository();
    repo.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "سارة", phone: "0551112222", budget: 200000, samples: false }));
    return repo;
  };
  it("يقترح لكل بند حسب المدينة والطابع، ويرسل الطلبات دفعة واحدة", () => {
    const repo = setup();
    repo.apply(updateEvent({ style: ["najdi"] }));
    const plan = suggestPlan(repo.get());
    const venue = plan.find((l) => l.cat === "venue")!;
    expect(venue.picks[0].city).toBe("الرياض");
    expect(venue.budget).toBe(64000);
    const hosp = plan.find((l) => l.cat === "hosp")!;
    expect(hosp.picks.length).toBeGreaterThan(0);
    const chosen = plan.filter((l) => l.picks[0]).map((l) => ({ line: l, pick: l.picks[0] }));
    repo.apply(requestPlan(chosen, { name: "سارة", phone: "0551112222" }));
    const mine = repo.get().bookings.filter((b) => b.fromPlan);
    expect(mine.length).toBe(chosen.length);
    expect(mine.every((b) => b.budget && b.cat)).toBe(true);
  });
  it("إلغاء الحجز المؤكد يمر بالإدارة، والإسناد البديل ينشئ طلباً جديداً", () => {
    const repo = setup();
    repo.apply(createBooking({ kind: "supplier", targetId: "s3", clientName: "سارة", phone: "0551112222", occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, note: "", estimate: 0, fromClient: true, cat: "hosp" }));
    const id = repo.get().bookings[0].id;
    repo.apply(setBookingStatus(id, "confirmed"));
    repo.apply(requestCancel(id, "ظرف طارئ"));
    expect(repo.get().bookings[0].status).toBe("confirmed");
    repo.apply(resolveCancel(id, false));
    expect(repo.get().bookings[0].cancelRequest).toBeUndefined();
    const alt = alternativesFor(repo.get(), repo.get().bookings[0]);
    expect(alt.every((a) => a.id !== "s3")).toBe(true);
    if (alt[0]) {
      repo.apply(reassignBooking(id, { kind: "supplier", id: alt[0].id, name: alt[0].name }));
      expect(repo.get().bookings[0].reassignedFrom).toBe(id);
      expect(repo.get().bookings.find((b) => b.id === id)!.status).toBe("declined");
    }
  });
});

describe("الإدارة وسيط الطلبات، ودعم بحالات واضحة، وتعلّم من العميل", () => {
  const base = () => { const r = createMemoryRepository(); r.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "سارة", samples: false })); return r; };
  it("طلب العميل يبدأ عند الإدارة، ثم يُرسل للتاجر أو يُعتذر عنه بسبب", () => {
    const r = base();
    r.apply(createBooking({ kind: "venue", targetId: "v1", clientName: "سارة", phone: "0551112222", occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, note: "", estimate: 0, fromClient: true }));
    const id = r.get().bookings[0].id;
    expect(r.get().bookings[0].status).toBe("review");
    r.apply(forwardToVendor(id, "نرجو العرض"));
    expect(r.get().bookings[0].status).toBe("new");
    expect(r.get().bookings[0].messages.at(-1)!.from).toBe("admin");
    r.apply(rejectRequest(id, "التاريخ غير متاح"));
    expect(r.get().bookings[0].status).toBe("declined");
  });
  it("التذكرة ما تُغلق إلا من الإدارة برد وسبب، والمستخدم يعيد فتحها برسالة", () => {
    const r = base();
    r.apply(openTicket({ from: "client", fromId: "me", fromName: "سارة", topic: "other", subject: "سؤال", text: "مرحبا" }));
    const id = r.get().tickets[0].id;
    r.apply(replyTicket(id, "admin", "أهلاً"));
    expect(r.get().tickets[0].status).toBe("answered");
    r.apply(closeTicket(id, "تم الرد على الاستفسار", "سعدنا بخدمتك"));
    expect(r.get().tickets[0].status).toBe("closed");
    expect(r.get().tickets[0].closedReason).toBe("تم الرد على الاستفسار");
    r.apply(reopenTicket(id, "user", "عندي سؤال ثاني"));
    expect(r.get().tickets[0].status).toBe("reopened");
  });
  it("يتعلم من الاختيار والرفض", () => {
    const r = base();
    const before = suggestPlan(r.get()).find((l) => l.cat === "venue")!.picks.map((p) => p.id);
    r.apply(learnPref(before[0], "dismiss"));
    const after = suggestPlan(r.get()).find((l) => l.cat === "venue")!.picks.map((p) => p.id);
    expect(after).not.toContain(before[0]);
    const last = after[after.length - 1];
    r.apply(learnPref(last, "like"));
    expect(suggestPlan(r.get()).find((l) => l.cat === "venue")!.picks[0].id).toBe(last);
  });
});

describe("ليلة المناسبة: غرفة التنسيق وختم الليلة", () => {
  const base = () => { const r = createMemoryRepository(); r.apply(createEvent({ occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, menRatio: 0.5, tier: "mid", title: "زواج", hostName: "سارة", samples: false })); return r; };
  it("كل طرف يرسل لغرفة التنسيق، والرسائل الفاضية ما تنحفظ", () => {
    const r = base();
    r.apply(postOp({ from: "men", text: "القسم امتلأ", kind: "alert" }));
    r.apply(postOp({ from: "client", text: "ابدأوا العشاء" }));
    r.apply(postOp({ from: "admin", text: "   " }));
    const ops = r.get().ops!;
    expect(ops.map((o) => [o.from, o.kind])).toEqual([["men", "alert"], ["client", "msg"]]);
  });
  it("ختم الليلة يحفظ الشكر والتقييم ويبلغ الفريق، والتراجع يرجعها مفتوحة", () => {
    const r = base();
    const v = r.get().venues[0];
    r.apply(createBooking({ kind: "venue", targetId: v.id, hallId: v.halls[0].id, clientName: "سارة", phone: "0551234567", occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, note: "", estimate: 0, fromClient: true }));
    const b = r.get().bookings.find((x) => x.fromClient)!;
    r.apply(endEvent({ thanks: "", ratings: { [b.id]: 9 } }));
    const db = r.get();
    expect(db.client.event!.endedAt).toBeTruthy();
    expect(db.client.event!.thanks).toBe(DEFAULT_THANKS);
    expect(db.bookings.find((x) => x.id === b.id)!.rating!.stars).toBe(5);
    expect(db.ops!.at(-1)!.kind).toBe("done");
    r.apply(reopenEvent());
    expect(r.get().client.event!.endedAt).toBeUndefined();
  });
});

describe("رسالة الدعوة في الواتساب", () => {
  it("العنوان «دعوة لزواج فيصل» والرسالة فيها اسم الضيف والموعد والرابط", () => {
    expect(inviteTitle("زواج فيصل")).toBe("دعوة لزواج فيصل");
    expect(inviteTitle("الملكة")).toBe("دعوة للملكة");
    const m = inviteMessage({ title: "زواج فيصل", date: "2027-01-23" }, { name: "أبو سعد، محمد", section: "men" }, "https://x.app/i/ABC123", "20:30");
    expect(m).toContain("يا هلا والله أبو سعد");
    expect(m).toContain("زواج فيصل");
    expect(m).toContain("السبت");
    expect(m.endsWith("https://x.app/i/ABC123")).toBe(true);
    expect(normCode("https://x.app/i/abc123")).toBe("ABC123");
  });
});

describe("كل مناسبة لها نظامها", () => {
  it("توزيع كل مناسبة مجموعه ١٠٠٪، والبنود والبرنامج على نوعها", () => {
    for (const p of Object.values(OCCASION_PROFILES)) expect(Math.round(p.split.reduce((a, l) => a + l.pct, 0) * 100)).toBe(100);
    const r = createMemoryRepository();
    r.apply(createEvent({ occasion: "birthday", place: "home", city: "الدمام", date: "2027-03-10", guests: 30, menRatio: 0.5, tier: "mid", title: "عيد ميلاد", hostName: "نورة", budget: 6000, samples: false }));
    const db = r.get();
    expect(db.client.budget.some((l) => l.cat === "venue")).toBe(false);
    expect(db.client.budget.reduce((a, l) => a + l.est, 0)).toBeGreaterThan(5800);
    expect(db.client.invite.program!.some((p) => p.title.includes("الكيك"))).toBe(true);
    const cats = suggestPlan(db).map((l) => l.cat);
    expect(cats[0]).toBe("kosha");
    expect(cats).toContain("cake");
    expect(cats).not.toContain("venue");
  });
});

describe("حماية المنصة: التسعير والدفع والاتفاقية وإخفاء الأرقام", () => {
  it("يخفي الأرقام والحسابات ويترك المبالغ والتواريخ", () => {
    for (const t of ["كلمني 0551234567", "واتساب ٠٥٥١٢٣٤٥٦٧", "+966 55 123 4567", "سناب: bawareq_events", "تابعني @myshop", "www.myshop.com", "me@shop.sa", "wa.me/966551234567"])
      expect(maskContacts(t).hit).toBe(true);
    for (const t of ["السعر 25000 ريال", "يوم 2027-01-23", "عدد الضيوف 450", "الكوشة ٦٠٠٠"])
      expect(maskContacts(t)).toEqual({ text: t, hit: false });
  });
  it("التاجر يرسل سعره الصافي، والعميل يشوف سعر مناسبتي، والعربون يتأكد من الإدارة", () => {
    expect(clientPriceFor(20000)).toBe(23000);
    expect(clientPriceFor(800)).toBe(1100); // الحد الأدنى ٣٠٠
    const r = createMemoryRepository();
    r.apply(createEvent({ occasion: "milka", city: "الدمام", date: "2027-03-01", guests: 100, menRatio: 0.5, tier: "mid", title: "ملكة", hostName: "سارة", samples: false }));
    const s = r.get().suppliers[0];
    r.apply(createBooking({ kind: "supplier", targetId: s.id, clientName: "سارة", phone: "0551234567", occasion: "milka", city: "الدمام", date: "2027-03-01", guests: 100, note: "", estimate: 0, fromClient: true }));
    const id = r.get().bookings.find((b) => b.fromClient)!.id;
    r.apply(forwardToVendor(id));
    r.apply(sendQuote(id, 6000, "جوالي 0551112222"));
    let b = r.get().bookings.find((x) => x.id === id)!;
    expect(b.quote).toBe(6000);
    expect(b.clientPrice).toBe(6900);
    expect(b.messages.at(-1)!.text).not.toContain("0551112222");
    r.apply(acceptQuote(id, "الكوشة"));
    b = r.get().bookings.find((x) => x.id === id)!;
    expect(b.pay!.stage).toBe("due");
    expect(depositFor(b)).toBe(2070);
    r.apply(claimPaid(id)); r.apply(confirmPaid(id));
    expect(r.get().bookings.find((x) => x.id === id)!.pay!.stage).toBe("paid");
    r.apply(bookingMessage(id, "client", "ارسل لي رقمك 0559998888"));
    expect(r.get().bookings.find((x) => x.id === id)!.leaks).toBe(1);
  });
  it("التاجر يوقّع الاتفاقية", () => {
    const r = createMemoryRepository();
    const s = r.get().suppliers[0];
    expect(hasAgreement(s)).toBe(false);
    r.apply(acceptAgreement("supplier", s.id, "محمد"));
    expect(hasAgreement(r.get().suppliers.find((x) => x.id === s.id))).toBe(true);
  });
});
