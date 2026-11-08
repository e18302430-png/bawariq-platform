import { describe, expect, it } from "vitest";
import {
  acceptQuote, busyDays, checkIn, createBooking, createEvent, createMemoryRepository, estimateBudget,
  hospitality, isWeekend, matchVenues, setBookingStatus, shiftDate, SEED_VENUES, hallPrice, journey, nextStage,
} from "./index";

describe("الحسابات", () => {
  it("حاسبة الضيافة: ذبيحة لكل 8 رجال و9 نساء", () => {
    const h = hospitality(80, 90);
    expect(h.sheep).toBe(20);
    expect(hospitality(80, 90, "buffet").sheep).toBe(10);
    expect(h.servers).toBe(4);
  });

  it("الميزانية تتضاعف مع المستوى الفاخر", () => {
    const mid = estimateBudget(400, "mid").total;
    const lux = estimateBudget(400, "lux").total;
    expect(lux).toBeGreaterThan(mid * 1.6);
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
