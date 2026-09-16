"use client";
import { useState } from "react";
import DatePickerAvailable from "@/components/DatePickerAvailable";
import { CheckCircle2, Paperclip, X, Loader2 } from "lucide-react";
import { siteConfig } from "@/site.config";
import { uploadCustomOrderImage } from "@/lib/publicUpload";

const PIECE_TYPES = siteConfig.customOrderEvents || ["Autre"];

export default function CustomOrderForm({ settings }: { settings: any }) {
  const [form, setForm] = useState({
    client: "",
    email: "",
    phone: "",
    eventType: PIECE_TYPES[0],
    parts: 10,
    pickupDate: "",
    slot: settings.slots?.[0] || "",
    note: "",
  });
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentPreview(URL.createObjectURL(file));
    setUploadingAttachment(true);
    setError(null);
    try {
      const url = await uploadCustomOrderImage(file);
      setAttachmentUrl(url);
    } catch (err: any) {
      setError(err.message);
      setAttachmentPreview(null);
    } finally {
      setUploadingAttachment(false);
    }
  }

  function removeAttachment() {
    setAttachmentUrl(null);
    setAttachmentPreview(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: form.client,
          email: form.email,
          phone: form.phone,
          items: [
            {
              productId: "custom",
              name: `Sur-mesure · ${form.eventType} · qté ${form.parts}`,
              quantity: 1,
              price: 0,
            },
          ],
          total: 0,
          pickupDate: form.pickupDate,
          slot: form.slot,
          mode: "pickup",
          note: `[DEMANDE SUR-MESURE]\nType: ${form.eventType}\nQuantité: ${form.parts}\n\nDescription:\n${form.note}`,
          attachmentUrl: attachmentUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-[var(--muted)] p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--primary)]" />
        <h2 className="mt-4 font-serif text-2xl">Demande envoyée</h2>
        <p className="mt-2 text-sm text-[var(--foreground)]/60">
          Nous revenons vers vous sous 24h ouvrées avec un devis personnalisé.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl bg-[var(--muted)] p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-xl">Vos coordonnées</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom complet *" value={form.client} onChange={(v) => setForm({ ...form, client: v })} required />
          <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--muted)] p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-xl">Votre projet</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Type de pièce</label>
            <select
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              className="w-full rounded-lg border border-[var(--accent)] bg-[var(--muted)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            >
              {PIECE_TYPES.map((ev) => (
                <option key={ev}>{ev}</option>
              ))}
            </select>
          </div>
          <Field type="number" label="Quantité souhaitée" value={form.parts} onChange={(v) => setForm({ ...form, parts: parseInt(v) || 1 })} />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Décrivez votre demande *</label>
          <textarea
            rows={5}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            required
            placeholder="Métal souhaité, pierre, gravure, taille, inspirations…"
            className="w-full rounded-lg border border-[var(--accent)] bg-[var(--muted)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Photo d&apos;inspiration (optionnel)</label>
          {attachmentPreview ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachmentPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
              {uploadingAttachment ? (
                <span className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Envoi…
                </span>
              ) : (
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <X className="h-3.5 w-3.5" /> Retirer
                </button>
              )}
            </div>
          ) : (
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--accent)] px-4 py-2.5 text-xs text-[var(--foreground)]/60 hover:border-[var(--primary)] hover:text-[var(--primary)]">
              <Paperclip className="h-4 w-4" />
              Joindre une photo (modèle, croquis, bijou à reproduire…)
              <input type="file" accept="image/*" onChange={handleAttachment} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {siteConfig.features.pickupCalendar && (
      <div className="rounded-2xl bg-[var(--muted)] p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-xl">Retrait souhaité</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <DatePickerAvailable
            label="Date *"
            value={form.pickupDate}
            onChange={(v) => setForm({ ...form, pickupDate: v })}
            minDays={Math.max(2, settings.minDelay || 2)}
            openWeekdays={settings.openWeekdays}
            closedDates={settings.closedDates}
          />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Créneau</label>
            <select
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
              className="w-full rounded-lg border border-[var(--accent)] bg-[var(--muted)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            >
              {(settings.slots || []).map((s: string) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      )}

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <button
        type="submit"
        disabled={submitting || uploadingAttachment}
        className="w-full rounded-sm bg-[var(--primary)] py-4 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60"
      >
        {submitting ? "Envoi…" : uploadingAttachment ? "Envoi de la photo…" : "Envoyer ma demande"}
      </button>
      <p className="text-center text-xs text-[var(--foreground)]/50">
        Nous vous recontacterons pour confirmer la faisabilité et le prix.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-[var(--accent)] bg-[var(--muted)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
      />
    </div>
  );
}
