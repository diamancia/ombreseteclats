"use client";
import { useEffect, useState } from "react";
import { adminFetch, uploadImage, IMAGE_PRESETS } from "@/lib/adminClient";
import { Plus, Edit, Trash2, Upload, X, ExternalLink } from "lucide-react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function statusOf(p: any): { label: string; color: string } {
  const now = Date.now();
  if (!p.active) return { label: "Brouillon", color: "bg-gray-100 text-gray-600" };
  if (p.startAt && new Date(p.startAt).getTime() > now) return { label: "Programmée", color: "bg-blue-50 text-blue-600" };
  if (p.endAt && new Date(p.endAt).getTime() <= now) return { label: "Terminée", color: "bg-gray-100 text-gray-500" };
  return { label: "En ligne", color: "bg-green-50 text-green-700" };
}

export default function AdminLandingPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const p = await adminFetch("/api/landing-pages");
    setPages(p);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cette landing page ?")) return;
    await adminFetch(`/api/landing-pages/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Landing pages</h1>
          <p className="mt-1 text-xs text-gray-400">Pages promo mono-produit, programmables (lancement, durée, compte à rebours).</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)]"
        >
          <Plus className="h-4 w-4" /> Nouvelle landing page
        </button>
      </div>

      {pages.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune landing page pour l&apos;instant.</p>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => {
            const status = statusOf(p);
            return (
              <div key={p._id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 text-gray-300">
                    {p.images?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      "—"
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.productName}</p>
                    <p className="text-xs text-gray-400">/promo/{p.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.color}`}>
                    {status.label}
                  </span>
                  <a
                    href={`/promo/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Voir la page"
                    className="text-gray-400 hover:text-[var(--primary)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => setEditing(p)} title="Modifier" className="text-gray-400 hover:text-[var(--primary)]">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(p._id)} title="Supprimer" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <LandingPageModal
          page={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

function LandingPageModal({ page, onClose, onSaved }: { page: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    productName: page.productName || "",
    slug: page.slug || "",
    kicker: page.kicker || "",
    tagline: page.tagline || "",
    images: page.images || [],
    priceOriginal: page.priceOriginal ?? "",
    priceCurrent: page.priceCurrent ?? "",
    specs: page.specs || [],
    ctaLabel: page.ctaLabel || "Acheter maintenant",
    ctaLink: page.ctaLink || "/sur-mesure",
    startAt: toLocalInput(page.startAt),
    endAt: toLocalInput(page.endAt),
    active: page.active ?? false,
  });
  const [slugTouched, setSlugTouched] = useState(!!page.slug);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<typeof form>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f, IMAGE_PRESETS.product)));
      update({ images: [...form.images, ...urls] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        priceOriginal: parseFloat(String(form.priceOriginal)) || 0,
        priceCurrent: parseFloat(String(form.priceCurrent)) || 0,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      };
      if (page._id) {
        await adminFetch(`/api/landing-pages/${page._id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/landing-pages", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{page._id ? "Modifier la landing page" : "Nouvelle landing page"}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Nom du produit *</label>
            <input
              value={form.productName}
              onChange={(e) => {
                const name = e.target.value;
                update({ productName: name, slug: slugTouched ? form.slug : slugify(name) });
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Adresse de la page — /promo/<span className="normal-case font-normal text-gray-400">slug</span>
            </label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update({ slug: slugify(e.target.value) });
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Sur-titre (optionnel)</label>
            <input
              placeholder="Collection Femme — Édition limitée"
              value={form.kicker}
              onChange={(e) => update({ kicker: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Accroche</label>
            <textarea
              rows={2}
              value={form.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Prix original (DH) *</label>
              <input
                type="number"
                value={form.priceOriginal}
                onChange={(e) => update({ priceOriginal: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Prix promo (DH) *</label>
              <input
                type="number"
                value={form.priceCurrent}
                onChange={(e) => update({ priceCurrent: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Galerie photo</h3>
              <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                <Upload className="h-3 w-3" /> {uploading ? "Envoi…" : "Ajouter des photos"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            </div>
            {form.images.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune photo — un visuel d&apos;attente s&apos;affichera à la place.</p>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {form.images.map((url: string, i: number) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gray-600">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => update({ images: form.images.filter((_: string, idx: number) => idx !== i) })}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SpecsEditor value={form.specs} onChange={(v) => update({ specs: v })} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Texte du bouton</label>
              <input
                value={form.ctaLabel}
                onChange={(e) => update({ ctaLabel: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Lien du bouton</label>
              <input
                value={form.ctaLink}
                onChange={(e) => update({ ctaLink: e.target.value })}
                placeholder="/sur-mesure"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Programmation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs text-gray-500">Lancement de la page</label>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => update({ startAt: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-gray-400">Vide = accessible dès l&apos;activation.</p>
              </div>
              <div>
                <label className="mb-2 block text-xs text-gray-500">Fin de l&apos;offre (compte à rebours)</label>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => update({ endAt: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-gray-400">Vide = pas de compte à rebours.</p>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => update({ active: e.target.checked })} />
              <span className="text-sm">Page active (accessible publiquement une fois lancée)</span>
            </label>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-sm border border-gray-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-gray-600">
              Annuler
            </button>
            <button
              onClick={save}
              disabled={saving || !form.productName || !form.slug}
              className="rounded-sm bg-[var(--primary)] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Spec = { label: string; value: string };

function SpecsEditor({ value, onChange }: { value: Spec[]; onChange: (v: Spec[]) => void }) {
  function update(idx: number, patch: Partial<Spec>) {
    onChange(value.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider">Fiche technique</h3>
      <p className="mb-3 text-xs text-gray-400">Ex : Poids / 0.18 carat, Pureté / VVS, Couleur / F — librement modifiable.</p>
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              placeholder="Libellé (ex: Pureté)"
              value={s.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
            />
            <input
              placeholder="Valeur (ex: VVS)"
              value={s.value}
              onChange={(e) => update(i, { value: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, { label: "", value: "" }])}
        className="mt-2 flex items-center gap-1 text-xs font-semibold uppercase text-[var(--primary)] hover:underline"
      >
        <Plus className="h-3 w-3" /> Ajouter une caractéristique
      </button>
    </div>
  );
}
