"use client";
import { useEffect, useState } from "react";
import { adminFetch, uploadImage, IMAGE_PRESETS } from "@/lib/adminClient";
import { Upload, Save, Plus, Trash2 } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { SOCIAL_PLATFORMS, SocialIcon, normalizePlatformKey } from "@/components/SocialIcon";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  if (!settings) return <p>Chargement…</p>;

  async function save() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const payload = { ...settings };
      if (!payload.adminPassword) delete payload.adminPassword;
      await adminFetch("/api/settings", { method: "PUT", body: JSON.stringify(payload) });
      setMsg("Paramètres enregistrés");
      setSettings({ ...settings, adminPassword: "" });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleHero(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingHero(true);
    try {
      const url = await uploadImage(f, IMAGE_PRESETS.hero);
      setSettings({ ...settings, heroImageUrl: url });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploadingHero(false);
    }
  }

  async function handleBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingBanner(true);
    try {
      const url = await uploadImage(f, IMAGE_PRESETS.hero);
      setSettings({ ...settings, bannerUrl: url });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploadingBanner(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-serif text-3xl">Paramètres</h1>

      <div className="space-y-6">
        <Card title="Identité de la marque">
          <Field label="Nom" value={settings.brandName || ""} onChange={(v) => setSettings({ ...settings, brandName: v })} />
          <Field label="Tagline" value={settings.brandTagline || ""} onChange={(v) => setSettings({ ...settings, brandTagline: v })} />
        </Card>

        <Card title="Navigation (barre du haut)">
          <NavLinksEditor value={settings.navLinks || []} onChange={(v) => setSettings({ ...settings, navLinks: v })} />
        </Card>

        <Card title="Page d'accueil (Hero)">
          <Field label="Titre" value={settings.heroTitle || ""} onChange={(v) => setSettings({ ...settings, heroTitle: v })} />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Sous-titre</label>
            <textarea
              rows={2}
              value={settings.heroSubtitle || ""}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Image de présentation</label>
            <div className="flex items-center gap-4">
              {settings.heroImageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={settings.heroImageUrl} alt="Hero" className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200 shadow-md" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)] px-4 py-2 text-xs text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]">
                <Upload className="h-4 w-4" /> {uploadingHero ? "Upload…" : "Changer l'image"}
                <input type="file" accept="image/*" onChange={handleHero} className="hidden" />
              </label>
            </div>
            <Field label="Ou URL directe" value={settings.heroImageUrl || ""} onChange={(v) => setSettings({ ...settings, heroImageUrl: v })} />
          </div>
        </Card>

        <Card title="Bannière publicitaire (pleine largeur)">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!settings.bannerEnabled}
              onChange={(e) => setSettings({ ...settings, bannerEnabled: e.target.checked })}
            />
            <span className="text-sm">Afficher la bannière sur la page d&apos;accueil</span>
          </label>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Type de média</label>
            <div className="flex gap-2">
              {(["photo", "video"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSettings({ ...settings, bannerType: t })}
                  className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
                    (settings.bannerType || "photo") === t
                      ? "bg-[var(--primary)] text-[var(--background)]"
                      : "border border-gray-200 text-gray-500"
                  }`}
                >
                  {t === "photo" ? "Photo" : "Vidéo"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Taille d&apos;affichage</label>
            <div className="flex gap-2">
              {(["compacte", "standard", "pleine"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSettings({ ...settings, bannerSize: s })}
                  className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
                    (settings.bannerSize || "standard") === s
                      ? "bg-[var(--primary)] text-[var(--background)]"
                      : "border border-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {(settings.bannerType || "photo") === "photo" ? (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Image</label>
              <div className="flex items-center gap-4">
                {settings.bannerUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={settings.bannerUrl} alt="Bannière" className="h-16 w-28 rounded-lg object-cover ring-2 ring-gray-200" />
                )}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)] px-4 py-2 text-xs text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]">
                  <Upload className="h-4 w-4" /> {uploadingBanner ? "Upload…" : "Changer l'image"}
                  <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
                </label>
              </div>
              <div className="mt-2">
                <Field label="Ou URL directe" value={settings.bannerUrl || ""} onChange={(v) => setSettings({ ...settings, bannerUrl: v })} />
              </div>
            </div>
          ) : (
            <Field
              label="URL de la vidéo (lien direct, YouTube ou Vimeo)"
              value={settings.bannerUrl || ""}
              onChange={(v) => setSettings({ ...settings, bannerUrl: v })}
            />
          )}

          <Field
            label="Lien au clic (optionnel)"
            value={settings.bannerLink || ""}
            onChange={(v) => setSettings({ ...settings, bannerLink: v })}
          />
        </Card>

        <Card title="Contact">
          <Field label="Email" type="email" value={settings.email || ""} onChange={(v) => setSettings({ ...settings, email: v })} />
          <Field label="Téléphone" value={settings.phone || ""} onChange={(v) => setSettings({ ...settings, phone: v })} />
          <Field label="Zone de livraison" value={settings.zone || ""} onChange={(v) => setSettings({ ...settings, zone: v })} />
          <Field
            label="Adresse (affiche une carte Google Maps sur la page Contact)"
            value={settings.address || ""}
            onChange={(v) => setSettings({ ...settings, address: v })}
          />
          <p className="text-xs text-gray-400">
            Laisser vide si vous n&apos;avez pas de boutique/atelier ouvert au public — aucune carte ne s&apos;affichera.
          </p>
        </Card>

        <Card title="Réseaux sociaux — Publication automatique">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.socialAutoPublish !== false}
              onChange={(e) => setSettings({ ...settings, socialAutoPublish: e.target.checked })}
            />
            <span className="text-sm">Publier automatiquement un produit validé sur Facebook / Instagram</span>
          </label>
          <p className="text-xs text-gray-400">
            Le bouton « Publier » reste toujours disponible sur chaque produit pour republier ou forcer une publication manuelle, même en mode automatique.
          </p>
        </Card>

        <Card title="Pied de page — Réseaux sociaux">
          <SocialLinksEditor value={settings.socialLinks || []} onChange={(v) => setSettings({ ...settings, socialLinks: v })} />
        </Card>

        <Card title="Créneaux de retrait">
          <Field
            label="Créneaux (séparés par virgule)"
            value={(settings.slots || []).join(", ")}
            onChange={(v) => setSettings({ ...settings, slots: v.split(",").map((s: string) => s.trim()).filter(Boolean) })}
          />
          <Field type="number" label="Délai minimum global (heures)" value={settings.minDelay || 2} onChange={(v) => setSettings({ ...settings, minDelay: parseInt(v) || 2 })} />
          <WeekdayPicker value={settings.openWeekdays || [2, 3, 4, 5, 6]} onChange={(v) => setSettings({ ...settings, openWeekdays: v })} />
          <ClosedDatesPicker value={settings.closedDates || []} onChange={(v) => setSettings({ ...settings, closedDates: v })} />
        </Card>

        <Card title="Page À propos">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Texte affiché sur la page À propos</label>
            <textarea
              rows={8}
              value={settings.about || ""}
              onChange={(e) => setSettings({ ...settings, about: e.target.value })}
              placeholder="Décrivez votre histoire, vos valeurs…"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </Card>

        <Card title="Modules">
          <p className="text-xs text-gray-400">
            Active ou désactive les fonctionnalités du site — aucune installation, tout est déjà intégré au code.
          </p>
          <ModulesPanel value={settings.moduleFlags || {}} onChange={(v) => setSettings({ ...settings, moduleFlags: v })} />
        </Card>

        <Card title="Mot de passe admin">
          <Field
            type="password"
            label="Nouveau mot de passe (laisser vide pour ne pas changer)"
            value={settings.adminPassword || ""}
            onChange={(v) => setSettings({ ...settings, adminPassword: v })}
          />
        </Card>

        {msg && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-serif text-xl">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
      />
    </div>
  );
}

const WEEKDAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

function WeekdayPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Jours d&apos;ouverture</label>
      <p className="mb-3 text-xs text-gray-400">Décochez vos jours de fermeture (ex : dimanche et lundi).</p>
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((name, idx) => {
          const active = value.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (active) onChange(value.filter((v) => v !== idx));
                else onChange([...value, idx].sort());
              }}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                active ? "bg-[var(--primary)] text-[var(--background)]" : "border border-gray-200 text-gray-500"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClosedDatesPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [newDate, setNewDate] = useState("");
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Jours fermés (fériés, congés…)</label>
      <div className="mb-3 flex gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (!newDate || value.includes(newDate)) return;
            onChange([...value, newDate].sort());
            setNewDate("");
          }}
          className="rounded-sm bg-[var(--primary)] px-4 text-xs font-semibold uppercase tracking-widest text-[var(--background)]"
        >
          Ajouter
        </button>
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-gray-400">Aucune date fermée</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.map((d) => (
            <span key={d} className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs">
              {d}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== d))} className="text-red-600">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type NavLink = { href: string; label: string };

function NavLinksEditor({ value, onChange }: { value: NavLink[]; onChange: (v: NavLink[]) => void }) {
  function update(idx: number, patch: Partial<NavLink>) {
    onChange(value.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
          <div className="flex flex-col">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
              ▲
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
              ▼
            </button>
          </div>
          <input
            placeholder="Libellé"
            value={l.label}
            onChange={(e) => update(i, { label: e.target.value })}
            className="w-40 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
          />
          <input
            placeholder="/chemin"
            value={l.href}
            onChange={(e) => update(i, { href: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
          />
          <button type="button" onClick={() => remove(i)} className="text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { href: "/", label: "Nouveau lien" }])}
        className="flex items-center gap-1 text-xs font-semibold uppercase text-[var(--primary)] hover:underline"
      >
        <Plus className="h-3 w-3" /> Ajouter un lien de navigation
      </button>
    </div>
  );
}

type SocialLink = { platform: string; url: string; active: boolean };

function SocialLinksEditor({ value, onChange }: { value: SocialLink[]; onChange: (v: SocialLink[]) => void }) {
  function update(idx: number, patch: Partial<SocialLink>) {
    onChange(value.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">
        Coche un réseau, colle son URL directe — il apparaît aussitôt en pied de page avec sa
        propre icône. Décoche pour le retirer sans perdre le lien enregistré.
      </p>
      {value.map((s, i) => {
        const key = normalizePlatformKey(s.platform);
        const isCustom = key === "autre";
        return (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-[var(--primary)] ring-1 ring-gray-200">
              <SocialIcon platform={s.platform} className="h-4 w-4" />
            </div>
            <select
              value={key}
              onChange={(e) => update(i, { platform: e.target.value === "autre" ? "" : e.target.value })}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            {isCustom && (
              <input
                placeholder="Nom du réseau"
                value={s.platform}
                onChange={(e) => update(i, { platform: e.target.value })}
                className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
              />
            )}
            <input
              placeholder="https://…"
              value={s.url}
              onChange={(e) => update(i, { url: e.target.value })}
              className="min-w-[180px] flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
            />
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input type="checkbox" checked={s.active !== false} onChange={(e) => update(i, { active: e.target.checked })} />
              Actif
            </label>
            <button type="button" onClick={() => remove(i)} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...value, { platform: "instagram", url: "", active: true }])}
        className="flex items-center gap-1 text-xs font-semibold uppercase text-[var(--primary)] hover:underline"
      >
        <Plus className="h-3 w-3" /> Ajouter un réseau social
      </button>
    </div>
  );
}

function ModulesPanel({ value, onChange }: { value: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void }) {
  return (
    <div className="space-y-2">
      {MODULES.map((m) => {
        const active = value[m.key] !== false;
        return (
          <div key={m.key} className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-400">{m.description}</p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => onChange({ ...value, [m.key]: e.target.checked })}
              />
              <span className="text-xs text-gray-500">{active ? "Actif" : "Inactif"}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
