"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminClient";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import ProductModal from "@/components/admin/ProductModal";
import ProductSocialButtons from "@/components/admin/ProductSocialButtons";
import MultiPhotoImport from "@/components/admin/MultiPhotoImport";
import { DEFAULT_METAL_TYPES, DEFAULT_GOLD_COLORS } from "@/lib/metals";
import type { SocialChannel } from "@/lib/socialChannels";

const STATUS_LABELS: Record<string, string> = {
  available: "disponible",
  unavailable: "épuisé",
  soon: "bientôt",
  pending: "à valider",
  on_order: "à commander",
};

function newProduct() {
  return {
    name: "",
    basePrice: 0,
    status: "available",
    isNew: false,
    imageUrl: "",
    images: [],
    category: "",
    gender: "homme",
    delay: 2,
    stock: 0,
    shortDesc: "",
    longDesc: "",
    videoUrl: "",
    allergens: "",
    isPromo: false,
    discountPct: 0,
    flavors: [],
    sizes: [],
    customLength: { enabled: false, presets: [39, 42], minCm: 30, maxCm: 70 },
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const socialModuleEnabled = settings?.moduleFlags?.social_publish !== false;

  async function load() {
    const [p, c, s] = await Promise.all([
      fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/categories?all=true", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()),
    ]);
    setProducts(p);
    setCategories(c);
    setSettings(s);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await adminFetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  async function publishSocial(id: string, channel?: SocialChannel) {
    const key = channel ? `${id}:${channel}` : id;
    setPublishingId(key);
    try {
      await adminFetch(`/api/products/${id}/publish-social`, {
        method: "POST",
        body: channel ? JSON.stringify({ channel }) : undefined,
      });
    } catch {
      // L'échec est reflété par le statut "failed"/l'erreur par canal renvoyés et rechargés
      // ci-dessous ; pas besoin d'un second message d'erreur ici.
    } finally {
      setPublishingId(null);
      load();
    }
  }

  async function validate(id: string) {
    await adminFetch(`/api/products/${id}`, { method: "PUT", body: JSON.stringify({ status: "available" }) });
    // Publication auto sur les réseaux sociaux si le module est actif et le réglage l'autorise.
    if (socialModuleEnabled && settings?.socialAutoPublish !== false) {
      await publishSocial(id);
    } else {
      load();
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Produits</h1>
        <div className="flex items-center gap-3">
          {settings?.moduleFlags?.import_multiphotos !== false && (
            <button
              onClick={() => setImporting(true)}
              className="flex items-center gap-2 rounded-sm border border-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
            >
              <Upload className="h-4 w-4" /> Ajout multi-photos
            </button>
          )}
          <button
            onClick={() => setEditing(newProduct())}
            className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)]"
          >
            <Plus className="h-4 w-4" /> Nouveau
          </button>
        </div>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Produit</th>
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3 text-center">Délai</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl">🍰</div>
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <div className="flex gap-1.5">
                          {p.isNew && <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-[9px] font-bold text-[var(--background)]">NEW</span>}
                          {p.aiGenerated?.description && (
                            <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--primary)]">VIA IA</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{p.basePrice.toFixed(2)}€</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{p.delay || 2} j</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        p.status === "available"
                          ? "bg-green-100 text-green-700"
                          : p.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : p.status === "on_order"
                          ? "bg-blue-50 text-blue-600"
                          : p.status === "unavailable"
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "pending" && (
                      <button onClick={() => validate(p._id)} className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] hover:underline">
                        Valider
                      </button>
                    )}
                    {socialModuleEnabled && (
                      <ProductSocialButtons
                        productId={p._id}
                        socialPostIds={p.socialPostIds}
                        socialPostError={p.socialPostError}
                        publishingId={publishingId}
                        onPublish={publishSocial}
                      />
                    )}
                    <button onClick={() => setEditing({ ...p, category: p.category?._id || "" })} className="mr-2 text-[var(--primary)]">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p._id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductModal
          initial={editing}
          categories={categories}
          metalTypes={settings?.metalTypes || DEFAULT_METAL_TYPES}
          goldColors={settings?.goldColors || DEFAULT_GOLD_COLORS}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
      {importing && (
        <MultiPhotoImport
          categories={categories}
          metalTypes={settings?.metalTypes || DEFAULT_METAL_TYPES}
          goldColors={settings?.goldColors || DEFAULT_GOLD_COLORS}
          aiEnabled={settings?.moduleFlags?.ai_description !== false}
          onClose={() => setImporting(false)}
          onImported={load}
        />
      )}
    </div>
  );
}
