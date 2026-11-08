import { describe, expect, it } from "vitest";
import {
  acceptQuote, busyDays, checkIn, createBooking, createEvent, createMemoryRepository, estimateBudget,
  hospitality, isWeekend, matchVenues, setBookingStatus, shiftDate, SEED_VENUES, hallPrice,
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
    const h = SEED_VENUES[0].halls[0];
    expect(hallPrice(h, "2026-11-13")).toBe(h.weekendPrice);
  });

  it("المطابقة تفضّل نفس المدينة والسعة الكافية", () => {
    const [first] = matchVenues(SEED_VENUES, "جدة", 1000);
    expect(first.venue.city).toBe("جدة");
    expect(first.venue.halls.some((h) => h.menCap + h.womenCap >= 1000)).toBe(true);
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
