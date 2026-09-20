"use client";
import { useState } from "react";
import { adminFetch, uploadImage, IMAGE_PRESETS } from "@/lib/adminClient";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { siteConfig } from "@/site.config";
import ProductAttributesFields from "@/components/admin/ProductAttributesFields";

const V1 = siteConfig.product.variant1;

export default function ProductModal({
  initial,
  categories,
  metalTypes,
  goldColors,
  onClose,
  onSaved,
}: {
  initial: any;
  categories: any[];
  metalTypes: { key: string; label: string }[];
  goldColors: { key: string; label: string; hex: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    ...initial,
    flavors: initial.flavors || [],
    sizes: initial.sizes || [],
    images: initial.images || [],
    customLength: initial.customLength || { enabled: false, presets: [39, 42], minCm: 30, maxCm: 70 },
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      // Strip temporary client-side _ids from flavors/sizes — Mongoose generates real ObjectIds.
      // For existing entries, Mongoose accepts a valid 24-char hex _id; client-random ids must go.
      const isValidObjectId = (v: any) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
      const cleanFlavors = (form.flavors || []).map((f: any) => {
        const { _id, ...rest } = f;
        return isValidObjectId(_id) ? { _id, ...rest } : rest;
      });
      const cleanSizes = (form.sizes || []).map((s: any) => {
        const { _id, ...rest } = s;
        return isValidObjectId(_id) ? { _id, ...rest } : rest;
      });
      const payload = {
        ...form,
        category: form.category || null,
        flavors: cleanFlavors,
        sizes: cleanSizes,
        discountPct: form.discountPct === "" ? 0 : form.discountPct,
        delay: form.delay === "" ? 2 : form.delay,
        stock: form.stock === "" ? 0 : form.stock,
      };
      if (form._id) {
        await adminFetch(`/api/products/${form._id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/products", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleMainImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file, IMAGE_PRESETS.product);
      setForm({ ...form, imageUrl: url });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImg(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{form._id ? "Modifier le produit" : "Nouveau produit"}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <Field label="Nom *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Description courte" value={form.shortDesc} onChange={(v) => setForm({ ...form, shortDesc: v })} />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Description longue</label>
            <textarea
              rows={3}
              value={form.longDesc}
              onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field type="number" label="Prix de base (€) *" value={form.basePrice} onChange={(v) => setForm({ ...form, basePrice: parseFloat(v) || 0 })} />
            <Field type="number" label={`${siteConfig.product.delayLabel} (jours)`} value={form.delay || ""} onChange={(v) => setForm({ ...form, delay: v === "" ? "" : parseInt(v) || 2 })} />
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Catégorie</label>
              <select
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {siteConfig.product.hasAllergens && (
            <Field label={siteConfig.product.allergensLabel} value={form.allergens} onChange={(v) => setForm({ ...form, allergens: v })} />
          )}

          <div className="grid grid-cols-3 gap-4">
            <Field
              type="number"
              label="Quantité en stock"
              value={form.stock || ""}
              onChange={(v) => setForm({ ...form, stock: v === "" ? "" : parseInt(v) || 0 })}
            />
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="available">Disponible</option>
                <option value="unavailable">Épuisé</option>
                <option value="on_order">À commander</option>
                <option value="soon">Bientôt</option>
                <option value="pending">À valider</option>
              </select>
              <p className="mt-1 text-[11px] text-gray-400">
                Recalculé automatiquement à l&apos;enregistrement à partir du stock (sauf Bientôt/À
                valider, laissés manuels).
              </p>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Collection</label>
              <select
                value={form.gender || "homme"}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="enfant">Enfant</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
              <span className="text-sm">Marquer comme nouveauté</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isPromo}
                  onChange={(e) => setForm({ ...form, isPromo: e.target.checked })}
                />
                <span className="text-sm">Réduction</span>
              </label>
              {form.isPromo && (
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPct || ""}
                  placeholder="%"
                  onChange={(e) => setForm({ ...form, discountPct: e.target.value === "" ? "" : Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-20 rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
                />
              )}
              {form.isPromo && <span className="text-xs text-gray-400">%</span>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Image principale</label>
            <p className="mb-3 text-xs text-gray-400">Affichée sur la boutique et en grand sur la page produit.</p>
            <div className="flex items-center gap-4">
              {form.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]">
                <Upload className="h-4 w-4" /> {uploadingImg ? "Upload…" : "Changer"}
                <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
              </label>
            </div>
          </div>

          <Field
            label="Vidéo (lien YouTube, ou lien direct vers un fichier vidéo déjà hébergé)"
            value={form.videoUrl}
            onChange={(v) => setForm({ ...form, videoUrl: v })}
          />

          <ImageGallerySection form={form} setForm={setForm} setError={setError} />

          {V1.enabled && <FlavorsSection form={form} setForm={setForm} setError={setError} />}

          <CustomLengthSection form={form} setForm={setForm} />

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Attributs de la pièce</h3>
            <ProductAttributesFields
              value={{ jewelryType: form.jewelryType, dimensionValue: form.dimensionValue, stone: form.stone, metal: form.metal, goldColor: form.goldColor, metalCustom: form.metalCustom }}
              onChange={(patch) => setForm({ ...form, ...patch })}
              metalTypes={metalTypes}
              goldColors={goldColors}
            />
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-sm border border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest">
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Galerie d'images supplémentaires (en plus de l'image principale ci-dessus).
function ImageGallerySection({ form, setForm, setError }: { form: any; setForm: (f: any) => void; setError: (e: string) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Galerie (images supplémentaires)</h3>
        <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--primary)] hover:underline">
          <Plus className="h-3 w-3" /> Ajouter une image
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (!files.length) return;
              try {
                const urls = await Promise.all(files.map((f) => uploadImage(f, IMAGE_PRESETS.product)));
                setForm({ ...form, images: [...form.images, ...urls] });
              } catch (err: any) {
                setError(err.message);
              }
            }}
          />
        </label>
      </div>
      {form.images.length === 0 ? (
        <p className="text-xs text-gray-400">Aucune image supplémentaire — la galerie utilisera uniquement l&apos;image principale.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {form.images.map((url: string, i: number) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, images: form.images.filter((_: string, idx: number) => idx !== i) })}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Variante 1 du site.config (ex. "Finition") — masquée si désactivée pour ce vertical.
function FlavorsSection({ form, setForm, setError }: { form: any; setForm: (f: any) => void; setError: (e: string) => void }) {
  function updateFlavor(idx: number, patch: any) {
    setForm({ ...form, flavors: form.flavors.map((f: any, i: number) => (i === idx ? { ...f, ...patch } : f)) });
  }
  function addFlavor() {
    setForm({ ...form, flavors: [...form.flavors, { _id: Math.random().toString(36).slice(2), name: "", imageUrl: "", surcharge: 0 }] });
  }
  function removeFlavor(idx: number) {
    setForm({ ...form, flavors: form.flavors.filter((_: any, i: number) => i !== idx) });
  }
  async function uploadFlavorImage(idx: number, file: File) {
    try {
      const url = await uploadImage(file, IMAGE_PRESETS.thumbnail);
      updateFlavor(idx, { imageUrl: url });
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">{V1.label}</h3>
        <button type="button" onClick={addFlavor} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
          <Plus className="h-3 w-3" /> Ajouter {V1.labelSingular}
        </button>
      </div>
      {form.flavors.length === 0 && <p className="text-xs text-gray-400">Aucun(e) {V1.labelSingular} — le produit sera vendu tel quel.</p>}
      <div className="space-y-3">
        {form.flavors.map((f: any, i: number) => (
          <div key={f._id || i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            {V1.hasImage && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-50">
                {f.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={f.imageUrl} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">img</div>
                )}
              </div>
            )}
            <input
              placeholder={V1.placeholder}
              value={f.name}
              onChange={(e) => updateFlavor(i, { name: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="+€"
              value={f.surcharge || 0}
              onChange={(e) => updateFlavor(i, { surcharge: parseFloat(e.target.value) || 0 })}
              className="w-20 rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
            />
            {V1.hasImage && (
              <label className="flex cursor-pointer items-center gap-1 rounded-md border border-[var(--primary)] px-2 py-1 text-[10px] uppercase text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]">
                <Upload className="h-3 w-3" /> Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFlavorImage(i, e.target.files[0])} />
              </label>
            )}
            <button type="button" onClick={() => removeFlavor(i)} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Longueur de chaîne personnalisable (bijouterie) — surcoût calculé globalement (Paramètres),
// jamais affiché séparément au client.
function CustomLengthSection({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <label className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!form.customLength?.enabled}
          onChange={(e) => setForm({ ...form, customLength: { ...form.customLength, enabled: e.target.checked } })}
        />
        <span className="text-sm font-semibold uppercase tracking-wider">Longueur personnalisable</span>
      </label>
      {form.customLength?.enabled && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Le client choisit une des longueurs courantes ou tape la longueur voulue (sur mesure). Le
            surcoût lié à la longueur est calculé automatiquement (réglage global dans Paramètres) et
            n&apos;est jamais affiché séparément au client.
          </p>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider">
              Longueurs courantes proposées (cm)
            </label>
            <input
              value={(form.customLength.presets || []).join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  customLength: {
                    ...form.customLength,
                    presets: e.target.value
                      .split(",")
                      .map((v) => parseFloat(v.trim()))
                      .filter((n) => !isNaN(n)),
                  },
                })
              }
              placeholder="39, 42"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider">Mini (cm)</label>
              <input
                type="number"
                value={form.customLength.minCm ?? 30}
                onChange={(e) => setForm({ ...form, customLength: { ...form.customLength, minCm: parseFloat(e.target.value) || 0 } })}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider">Maxi (cm)</label>
              <input
                type="number"
                value={form.customLength.maxCm ?? 70}
                onChange={(e) => setForm({ ...form, customLength: { ...form.customLength, maxCm: parseFloat(e.target.value) || 0 } })}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={type === "number" ? (e) => e.currentTarget.select() : undefined}
        className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
      />
    </div>
  );
}
