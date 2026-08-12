import React, { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

const EMPTY_FORM = { name: "", phone: "", department: "", date: "", notes: "" };

async function persist(key, payload) {
  if (typeof window === "undefined" || !window.storage) return;
  try {
    await window.storage.set(key, payload, true);
  } catch {
    /* storage optional — form still succeeds locally */
  }
}

export default function Appointments() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    await persist(`appointment-${Date.now()}`, { ...form, lang, createdAt: new Date().toISOString() });
    setStatus("success");
    setForm(EMPTY_FORM);
  };

  return (
    <section id="appointments" className="bg-surface-alt px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Reveal variant="start" as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
            {t.appointments.kicker}
          </Reveal>
          <Reveal
            variant="start"
            as="h2"
            delay={100}
            className="text-balance mt-4 font-arabic text-3xl font-bold text-ink sm:text-4xl"
          >
            {t.appointments.title}
          </Reveal>
          <Reveal variant="start" as="p" delay={180} className="mt-4 leading-relaxed text-ink-soft">
            {t.appointments.lead}
          </Reveal>
          <Reveal
            variant="start"
            delay={260}
            className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm leading-relaxed text-red-800">{t.appointments.emergencyNote}</p>
          </Reveal>
        </div>

        <Reveal variant="end" delay={120} as="form" onSubmit={onSubmit} className="rounded-3xl bg-surface p-6 shadow-soft sm:p-8">
          {status === "success" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary-600" />
              <p className="mt-4 max-w-sm text-base font-medium leading-relaxed text-ink">{t.appointments.success}</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold text-ink-soft"
              >
                {t.appointments.form.submit}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-ink">{t.appointments.form.name}</span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder={t.appointments.form.namePh}
                  className="rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink">{t.appointments.form.phone}</span>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder={t.appointments.form.phonePh}
                  className="rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                  dir="ltr"
                  style={{ textAlign: lang === "ar" ? "end" : "start" }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink">{t.appointments.form.date}</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={update("date")}
                  className="rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-ink">{t.appointments.form.department}</span>
                <select
                  required
                  value={form.department}
                  onChange={update("department")}
                  className="rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                >
                  <option value="" disabled>
                    {t.appointments.form.departmentPh}
                  </option>
                  {t.services.items.map((item) => (
                    <option key={item.title} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-ink">{t.appointments.form.notes}</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={update("notes")}
                  placeholder={t.appointments.form.notesPh}
                  className="resize-none rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                />
              </label>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60 sm:col-span-2"
              >
                {status === "submitting" ? t.appointments.form.submitting : t.appointments.form.submit}
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
