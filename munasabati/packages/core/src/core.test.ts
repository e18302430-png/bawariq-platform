import { describe, expect, it } from "vitest";
import {
  acceptQuote, busyDays, checkIn, createBooking, createEvent, createMemoryRepository, splitBudget, setTotalBudget, adminClients, adminUpdateClient, adminDeleteClient, adminUpdateBooking, normPhone, validPhone, enableDoor, maskContacts, suggestPlan, requestPlan, duesOf, setCommission, markCommissionPaid, requestCancel, resolveCancel, reassignBooking, alternativesFor, updateEvent,
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
    expect(db.client.budget.find((l) => l.cat === "venue")!.est).toBe(70000);
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

describe("الخطة المقترحة والدخل والحماية", () => {
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
    expect(venue.budget).toBe(70000);
    const hosp = plan.find((l) => l.cat === "hosp")!;
    expect(hosp.picks.length).toBeGreaterThan(0);
    const chosen = plan.filter((l) => l.picks[0]).map((l) => ({ line: l, pick: l.picks[0] }));
    repo.apply(requestPlan(chosen, { name: "سارة", phone: "0551112222" }));
    const mine = repo.get().bookings.filter((b) => b.fromPlan);
    expect(mine.length).toBe(chosen.length);
    expect(mine.every((b) => b.budget && b.cat)).toBe(true);
  });
  it("يخفي الأرقام والحسابات من المحادثة", () => {
    expect(maskContacts("كلمني على 0551234567").masked).toBe(true);
    expect(maskContacts("رقمي +966 55 123 4567").text).not.toMatch(/123/);
    expect(maskContacts("سناب: party_riyadh").masked).toBe(true);
    expect(maskContacts("السعر 15000 ريال للباقة").masked).toBe(false);
  });
  it("العمولة على التاجر فقط، وتُحسب من الحجوزات المؤكدة", () => {
    const repo = setup();
    repo.apply(setCommission({ rate: 5, graceDays: 7 }));
    repo.apply(createBooking({ kind: "supplier", targetId: "s3", clientName: "سارة", phone: "0551112222", occasion: "wedding", city: "الرياض", date: "2027-02-10", guests: 300, note: "", estimate: 0, fromClient: true }));
    const id = repo.get().bookings[0].id;
    repo.apply(setBookingStatus(id, "confirmed", { quote: 20000 }));
    let d = duesOf(repo.get(), "supplier", "s3", new Date("2027-03-01").getTime());
    expect(d[0].amount).toBe(1000);
    expect(d[0].state).toBe("overdue");
    repo.apply(markCommissionPaid([id]));
    d = duesOf(repo.get(), "supplier", "s3");
    expect(d[0].state).toBe("paid");
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
