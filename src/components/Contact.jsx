import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2, MapPinned } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

const EMPTY_FORM = { name: "", contactInfo: "", message: "" };

async function persist(key, payload) {
  if (typeof window === "undefined" || !window.storage) return;
  try {
    await window.storage.set(key, payload, true);
  } catch {
    /* storage optional — form still succeeds locally */
  }
}

export default function Contact() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    await persist(`contact-${Date.now()}`, { ...form, lang, createdAt: new Date().toISOString() });
    setStatus("success");
    setForm(EMPTY_FORM);
  };

  const infoRows = [
    { icon: MapPin, label: t.contact.addressLabel, value: t.contact.address },
    { icon: Phone, label: t.contact.phoneLabel, value: t.contact.phone },
    { icon: Mail, label: t.contact.emailLabel, value: t.contact.email },
    { icon: Clock, label: t.contact.hoursLabel, value: t.contact.hours },
  ];

  return (
    <section id="contact" className="bg-surface px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
            {t.contact.kicker}
          </Reveal>
          <Reveal as="h2" delay={100} className="text-balance mt-4 font-arabic text-3xl font-bold text-ink sm:text-4xl">
            {t.contact.title}
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 leading-relaxed text-ink-soft">
            {t.contact.lead}
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="space-y-6">
            <Reveal variant="start" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3 rounded-2xl border border-ink/8 bg-surface-alt p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <row.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">{row.label}</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">{row.value}</p>
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal
              variant="start"
              delay={120}
              className="flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-surface-alt text-ink-soft/70"
            >
              <MapPinned className="h-6 w-6" />
              <p className="max-w-[16rem] text-center text-xs leading-relaxed">{t.contact.mapNote}</p>
            </Reveal>
          </div>

          <Reveal variant="end" delay={100} as="form" onSubmit={onSubmit} className="rounded-3xl bg-surface-alt p-6 shadow-soft sm:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary-600" />
                <p className="mt-4 max-w-sm text-base font-medium leading-relaxed text-ink">{t.contact.success}</p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold text-ink-soft"
                >
                  {t.contact.form.submit}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">{t.contact.form.name}</span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder={t.contact.form.namePh}
                    className="rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">{t.contact.form.contactInfo}</span>
                  <input
                    required
                    type="text"
                    value={form.contactInfo}
                    onChange={update("contactInfo")}
                    placeholder={t.contact.form.contactInfoPh}
                    className="rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink">{t.contact.form.message}</span>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={update("message")}
                    placeholder={t.contact.form.messagePh}
                    className="resize-none rounded-xl border border-ink/15 bg-surface px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary-500"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {status === "submitting" ? t.contact.form.submitting : t.contact.form.submit}
                </button>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
