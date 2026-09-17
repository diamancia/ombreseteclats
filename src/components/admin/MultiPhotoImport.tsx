"use client";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { adminFetch, uploadImage, IMAGE_PRESETS } from "@/lib/adminClient";
import { UploadCloud, X, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ProductAttributesFields, { ProductAttrs } from "./ProductAttributesFields";
import { MetalType, GoldColor } from "@/lib/metals";

type ImportItem = ProductAttrs & {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  basePrice: number;
  category: string;
  gender: "homme" | "femme" | "enfant" | "mixte";
  shortDesc: string;
  longDesc: string;
  hashtags: string[];
  uploadedUrl?: string;
  status: "idle" | "uploading" | "ai-loading" | "ready" | "error";
  error?: string;
  isBlackFriday?: boolean;
  discountPct?: number;
  promoEndsAt?: string;
};

function fileNameToProductName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function stoneToText(stone?: ProductAttrs["stone"]): string | undefined {
  if (!stone) return undefined;
  return [stone.nature, stone.shape, stone.carats ? `${stone.carats} ct` : null]
    .filter(Boolean)
    .join(" ");
}

export default function MultiPhotoImport({
  categories,
  metalTypes = [],
  goldColors = [],
  aiEnabled = true,
  onClose,
  onImported,
}: {
  categories: any[];
  metalTypes?: MetalType[];
  goldColors?: GoldColor[];
  aiEnabled?: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [batchGender, setBatchGender] = useState<ImportItem["gender"]>("femme");
  const [batchCategory, setBatchCategory] = useState("");
  const [batchMetal, setBatchMetal] = useState("");
  const [batchGoldColor, setBatchGoldColor] = useState("");
  const [batchBlackFriday, setBatchBlackFriday] = useState(false);
  const [batchDiscountPct, setBatchDiscountPct] = useState(20);
  const [batchCountdownHours, setBatchCountdownHours] = useState(48);
  const itemsRef = useRef<ImportItem[]>([]);
  itemsRef.current = items;

  const topLevelCats = categories.filter((c) => !c.parent);
  const subCatsOf = (parentId: string) => categories.filter((c) => c.parent === parentId);

  function batchPromoFields() {
    if (!batchBlackFriday) return { isBlackFriday: false, discountPct: undefined, promoEndsAt: undefined };
    return {
      isBlackFriday: true,
      discountPct: batchDiscountPct,
      promoEndsAt: new Date(Date.now() + batchCountdownHours * 3600 * 1000).toISOString(),
    };
  }

  function applyBatchToAll() {
    const promo = batchPromoFields();
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        gender: batchGender,
        category: batchCategory || it.category,
        metal: batchMetal || it.metal,
        goldColor: batchMetal === "or" ? batchGoldColor || it.goldColor : undefined,
        ...promo,
      }))
    );
  }

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
  }, []);

  function updateItem(id: string, patch: Partial<ImportItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function runAiDescribe(id: string) {
    const item = itemsRef.current.find((it) => it.id === id);
    if (!item) return;
    updateItem(id, { status: "ai-loading", error: undefined });
    try {
      let uploadedUrl = item.uploadedUrl;
      if (!uploadedUrl) {
        updateItem(id, { status: "uploading" });
        uploadedUrl = await uploadImage(item.file, IMAGE_PRESETS.product);
        updateItem(id, { uploadedUrl, status: "ai-loading" });
      }
      const ai = await adminFetch("/api/products/ai-describe", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          jewelryType: item.jewelryType,
          stoneDescription: stoneToText(item.stone),
        }),
      });
      updateItem(id, {
        shortDesc: ai.shortDesc,
        longDesc: ai.longDesc,
        hashtags: ai.hashtags || [],
        status: "ready",
      });
    } catch (e: any) {
      updateItem(id, { status: "error", error: e.message });
    }
  }

  function addFiles(files: File[]) {
    const newItems: ImportItem[] = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
      name: fileNameToProductName(file.name),
      basePrice: 0,
      category: batchCategory,
      gender: batchGender,
      metal: batchMetal || undefined,
      goldColor: batchMetal === "or" ? batchGoldColor || undefined : undefined,
      shortDesc: "",
      longDesc: "",
      hashtags: [],
      status: "idle",
      ...batchPromoFields(),
    }));
    setItems((prev) => [...prev, ...newItems]);
    if (aiEnabled) newItems.forEach((it) => runAiDescribe(it.id));
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: addFiles,
  });

  function removeItem(id: string) {
    const it = items.find((i) => i.id === id);
    if (it) URL.revokeObjectURL(it.previewUrl);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  // Aucun champ n'est bloquant : on importe ce qui est rempli, le reste (prix, catégorie…) se
  // complète après coup dans la fiche produit sans empêcher l'enregistrement des photos.
  const readyToImport = items.length > 0;

  async function importAll() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // S'assurer que toutes les photos sont uploadées avant l'envoi.
      const withUrls = await Promise.all(
        items.map(async (it) => {
          if (it.uploadedUrl) return it;
          const url = await uploadImage(it.file, IMAGE_PRESETS.product);
          return { ...it, uploadedUrl: url };
        })
      );
      const payload = {
        items: withUrls.map((it) => ({
          name: it.name,
          basePrice: it.basePrice,
          category: it.category || null,
          gender: it.gender,
          imageUrl: it.uploadedUrl,
          images: [it.uploadedUrl],
          shortDesc: it.shortDesc,
          longDesc: it.longDesc,
          jewelryType: it.jewelryType || undefined,
          dimensionValue: it.dimensionValue || undefined,
          stone: it.stone || undefined,
          metal: it.metal || undefined,
          goldColor: it.metal === "or" ? it.goldColor || undefined : undefined,
          isBlackFriday: it.isBlackFriday || false,
          discountPct: it.discountPct || 0,
          promoEndsAt: it.promoEndsAt || undefined,
          aiGenerated: { description: !!it.shortDesc, hashtags: it.hashtags },
        })),
      };
      await adminFetch("/api/products/bulk", { method: "POST", body: JSON.stringify(payload) });
      onImported();
      onClose();
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Ajout multi-photos</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Collection (par défaut pour ce lot)
            </label>
            <select
              value={batchGender}
              onChange={(e) => setBatchGender(e.target.value as ImportItem["gender"])}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
            >
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="enfant">Enfant</option>
              <option value="mixte">Mixte</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Catégorie (par défaut pour ce lot)
            </label>
            <CategorySelect
              value={batchCategory}
              onChange={setBatchCategory}
              topLevelCats={topLevelCats}
              subCatsOf={subCatsOf}
            />
          </div>
          {metalTypes.length > 0 && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Métal (par défaut pour ce lot)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={batchMetal}
                  onChange={(e) => setBatchMetal(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                >
                  <option value="">—</option>
                  {metalTypes.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {batchMetal === "or" &&
                  goldColors.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      title={c.label}
                      aria-label={c.label}
                      onClick={() => setBatchGoldColor(c.key)}
                      className={`h-6 w-6 rounded-full ring-2 ${
                        batchGoldColor === c.key ? "ring-[var(--primary)]" : "ring-transparent hover:ring-gray-300"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <input
                type="checkbox"
                checked={batchBlackFriday}
                onChange={(e) => setBatchBlackFriday(e.target.checked)}
              />
              Black Friday (par défaut pour ce lot)
            </label>
            {batchBlackFriday && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={batchDiscountPct}
                  onChange={(e) => setBatchDiscountPct(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                />
                <span className="text-xs text-gray-400">% pendant</span>
                <input
                  type="number"
                  min={1}
                  value={batchCountdownHours}
                  onChange={(e) => setBatchCountdownHours(Math.max(1, parseInt(e.target.value) || 1))}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                />
                <span className="text-xs text-gray-400">heures</span>
              </div>
            )}
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={applyBatchToAll}
              className="rounded-sm border border-[var(--primary)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
            >
              Appliquer à toutes les photos déjà ajoutées
            </button>
          )}
        </div>
        <p className="mb-4 text-xs text-gray-400">
          Utile pour importer la collection Femme catégorie par catégorie : choisis "Femme" +
          "Bagues" ci-dessus, puis glisse toutes les photos de bagues — chaque nouvelle photo
          reprend ces réglages automatiquement, modifiables ensuite par photo si besoin.
        </p>

        <div
          {...getRootProps()}
          className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragActive ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Glissez-déposez des photos ici, ou cliquez pour en sélectionner plusieurs
          </p>
        </div>

        {items.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((it) => {
              const expanded = expandedId === it.id;
              return (
                <div key={it.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.previewUrl} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        value={it.name}
                        onChange={(e) => updateItem(it.id, { name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Prix (€)"
                          value={it.basePrice || ""}
                          onChange={(e) => updateItem(it.id, { basePrice: parseFloat(e.target.value) || 0 })}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                        />
                        <div className="flex-1">
                          <CategorySelect
                            value={it.category}
                            onChange={(v) => updateItem(it.id, { category: v })}
                            topLevelCats={topLevelCats}
                            subCatsOf={subCatsOf}
                          />
                        </div>
                      </div>
                      <select
                        value={it.gender}
                        onChange={(e) => updateItem(it.id, { gender: e.target.value as ImportItem["gender"] })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                      >
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="enfant">Enfant</option>
                        <option value="mixte">Mixte</option>
                      </select>
                    </div>
                    <button onClick={() => removeItem(it.id)} className="h-fit text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {(!it.basePrice || !it.category) && (
                    <p className="mt-2 text-[10px] text-amber-600">
                      {!it.basePrice && !it.category
                        ? "Sans prix ni catégorie pour l'instant — à compléter plus tard dans Produits."
                        : !it.basePrice
                        ? "Sans prix pour l'instant — à compléter plus tard dans Produits."
                        : "Sans catégorie pour l'instant — à compléter plus tard dans Produits."}
                    </p>
                  )}

                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                        {aiEnabled && <Sparkles className="h-3 w-3" />} {aiEnabled ? "Généré par IA" : "Description"}
                      </span>
                      {aiEnabled && (it.status === "uploading" || it.status === "ai-loading") && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                      {aiEnabled && it.status === "ready" && (
                        <button
                          type="button"
                          onClick={() => runAiDescribe(it.id)}
                          className="text-[10px] font-semibold uppercase text-[var(--primary)] hover:underline"
                        >
                          Régénérer
                        </button>
                      )}
                    </div>
                    {it.status === "error" ? (
                      <p className="text-xs text-red-600">{it.error}</p>
                    ) : (
                      <>
                        <textarea
                          rows={2}
                          placeholder={it.status === "ai-loading" ? "Génération en cours…" : "Description courte"}
                          value={it.shortDesc}
                          onChange={(e) => updateItem(it.id, { shortDesc: e.target.value })}
                          className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          placeholder="Description longue"
                          value={it.longDesc}
                          onChange={(e) => updateItem(it.id, { longDesc: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                        />
                        {it.hashtags.length > 0 && (
                          <p className="mt-2 text-[11px] text-gray-500">{it.hashtags.join(" ")}</p>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : it.id)}
                    className="mt-3 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Attributs de la pièce
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  {expanded && (
                    <div className="mt-3">
                      <ProductAttributesFields
                        value={{ jewelryType: it.jewelryType, dimensionValue: it.dimensionValue, stone: it.stone, metal: it.metal, goldColor: it.goldColor }}
                        onChange={(patch) => updateItem(it.id, patch)}
                        metalTypes={metalTypes}
                        goldColors={goldColors}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {submitError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</div>}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {items.length === 0
              ? "Aucune photo ajoutée"
              : `${items.length} photo${items.length > 1 ? "s" : ""} — remplis juste ce qui est prêt, le reste se complète après coup dans la fiche produit`}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-sm border border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest">
              Annuler
            </button>
            <button
              onClick={importAll}
              disabled={!readyToImport || submitting}
              className="rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60"
            >
              {submitting ? "Import…" : `Importer ${items.length} produit${items.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
  topLevelCats,
  subCatsOf,
}: {
  value: string;
  onChange: (v: string) => void;
  topLevelCats: any[];
  subCatsOf: (parentId: string) => any[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
    >
      <option value="">Catégorie…</option>
      {topLevelCats.map((c) => {
        const subs = subCatsOf(c._id);
        if (subs.length === 0) {
          return (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          );
        }
        return (
          <optgroup key={c._id} label={c.name}>
            <option value={c._id}>{c.name} (général)</option>
            {subs.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
