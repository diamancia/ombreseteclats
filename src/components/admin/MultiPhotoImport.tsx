"use client";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { adminFetch, uploadImage, IMAGE_PRESETS } from "@/lib/adminClient";
import { UploadCloud, X, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ProductAttributesFields, { ProductAttrs } from "./ProductAttributesFields";

type ImportItem = ProductAttrs & {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  basePrice: number;
  category: string;
  gender: "homme" | "femme" | "mixte";
  shortDesc: string;
  longDesc: string;
  hashtags: string[];
  uploadedUrl?: string;
  status: "idle" | "uploading" | "ai-loading" | "ready" | "error";
  error?: string;
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
  onClose,
  onImported,
}: {
  categories: any[];
  onClose: () => void;
  onImported: () => void;
}) {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const itemsRef = useRef<ImportItem[]>([]);
  itemsRef.current = items;

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
      category: "",
      gender: "homme",
      shortDesc: "",
      longDesc: "",
      hashtags: [],
      status: "idle",
    }));
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((it) => runAiDescribe(it.id));
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

  const readyToImport = items.length > 0 && items.every((it) => it.basePrice > 0 && it.category);

  async function importAll() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // S'assurer que toutes les photos sont uploadées sur R2 avant l'envoi.
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
                          className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                        />
                        <select
                          value={it.category}
                          onChange={(e) => updateItem(it.id, { category: e.target.value })}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                        >
                          <option value="">Catégorie…</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <select
                        value={it.gender}
                        onChange={(e) => updateItem(it.id, { gender: e.target.value as ImportItem["gender"] })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
                      >
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="mixte">Mixte</option>
                      </select>
                    </div>
                    <button onClick={() => removeItem(it.id)} className="h-fit text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                        <Sparkles className="h-3 w-3" /> Généré par IA
                      </span>
                      {(it.status === "uploading" || it.status === "ai-loading") && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                      {it.status === "ready" && (
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
                        value={{ jewelryType: it.jewelryType, dimensionValue: it.dimensionValue, stone: it.stone }}
                        onChange={(patch) => updateItem(it.id, patch)}
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
              : `${items.length} photo${items.length > 1 ? "s" : ""} — prix et catégorie requis pour chacune`}
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
