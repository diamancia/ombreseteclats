import { db, throwIfError } from "./client";
import { fromDbCategory, type Category } from "./categories";
import { getBestSellerProductIds } from "./orders";
export { effectivePrice } from "@/lib/pricing";

// Les fonctions ci-dessous renvoient des objets façonnés exactement comme le faisait
// Mongoose (camelCase, `_id`, `category` peuplée en objet imbriqué) pour que la bascule des
// 31 fichiers consommateurs (Phase 2) reste un remplacement mécanique d'appel, pas une
// réécriture de logique. Toute la conversion camelCase <-> snake_case Postgres est isolée ici.

export type Product = {
  _id: string;
  name: string;
  shortDesc?: string | null;
  longDesc?: string | null;
  basePrice: number;
  delay: number;
  isNew: boolean;
  status: "available" | "unavailable" | "soon" | "pending" | "on_order";
  stock: number;
  imageUrl?: string | null;
  images: string[];
  allergens?: string | null;
  category?: Category | null;
  gender: "homme" | "femme" | "enfant" | "mixte";
  flavors: any[];
  sizes: any[];
  customLength: { enabled: boolean; presets: number[]; minCm: number; maxCm: number };
  jewelryType?: string | null;
  dimensionValue?: string | null;
  stone?: any;
  metal?: string | null;
  goldColor?: string | null;
  metalCustom?: string | null;
  isPromo: boolean;
  discountPct: number;
  isBlackFriday: boolean;
  promoEndsAt?: string | null;
  aiGenerated: { description: boolean; hashtags: string[] };
  socialPostStatus: "none" | "pending" | "published" | "failed";
  socialPostedAt?: string | null;
  socialPostIds: { facebook?: string; instagram?: string };
  socialPostError?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Le select embarqué `category:categories(*)` reproduit `.populate("category")`.
const SELECT_WITH_CATEGORY = "*, category:categories(*)";

function fromDbProduct(row: any): Product {
  return {
    _id: row.id,
    name: row.name,
    shortDesc: row.short_desc,
    longDesc: row.long_desc,
    basePrice: Number(row.base_price),
    delay: row.delay,
    isNew: row.is_new,
    status: row.status,
    stock: row.stock ?? 0,
    imageUrl: row.image_url,
    images: row.images || [],
    allergens: row.allergens,
    category: row.category ? fromDbCategory(row.category) : null,
    gender: row.gender,
    flavors: row.flavors || [],
    sizes: row.sizes || [],
    customLength: row.custom_length || { enabled: false, presets: [39, 42], minCm: 30, maxCm: 70 },
    jewelryType: row.jewelry_type,
    dimensionValue: row.dimension_value,
    stone: row.stone,
    metal: row.metal,
    goldColor: row.gold_color,
    metalCustom: row.metal_custom,
    isPromo: row.is_promo ?? false,
    discountPct: row.discount_pct ?? 0,
    isBlackFriday: row.is_blackfriday ?? false,
    promoEndsAt: row.promo_ends_at,
    aiGenerated: row.ai_generated || { description: false, hashtags: [] },
    socialPostStatus: row.social_post_status,
    socialPostedAt: row.social_posted_at,
    socialPostIds: row.social_post_ids || {},
    socialPostError: row.social_post_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// camelCase (payload envoyé par l'admin/le front) -> colonnes snake_case. N'inclut que les
// clés présentes dans `patch`, comme le comportement `findByIdAndUpdate(id, body)` actuel
// (remplace les clés top-level envoyées, laisse les autres inchangées).
const FIELD_MAP: Record<string, string> = {
  shortDesc: "short_desc",
  longDesc: "long_desc",
  basePrice: "base_price",
  isNew: "is_new",
  imageUrl: "image_url",
  category: "category_id", // valeur attendue : id de catégorie (string), pas un objet peuplé
  customLength: "custom_length",
  jewelryType: "jewelry_type",
  dimensionValue: "dimension_value",
  goldColor: "gold_color",
  metalCustom: "metal_custom",
  isPromo: "is_promo",
  discountPct: "discount_pct",
  isBlackFriday: "is_blackfriday",
  promoEndsAt: "promo_ends_at",
  aiGenerated: "ai_generated",
  socialPostStatus: "social_post_status",
  socialPostedAt: "social_posted_at",
  socialPostIds: "social_post_ids",
  socialPostError: "social_post_error",
};
function toDbProduct(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

export async function listProducts(opts: {
  excludeId?: string;
  categoryId?: string;
  statusNot?: string;
  limit?: number;
} = {}): Promise<Product[]> {
  let q = db().from("products").select(SELECT_WITH_CATEGORY).order("created_at", { ascending: false });
  if (opts.excludeId) q = q.neq("id", opts.excludeId);
  if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts.statusNot) q = q.neq("status", opts.statusNot);
  if (opts.limit) q = q.limit(opts.limit);
  const rows = throwIfError(await q);
  return (rows || []).map(fromDbProduct);
}

// Produits les plus vendus (commandes payées, quantité cumulée). Sans historique de vente
// (nouvelle boutique), repli sur les produits les plus récents pour ne jamais afficher une
// section vide.
export async function listBestSellerProducts(limit = 12): Promise<Product[]> {
  const ids = await getBestSellerProductIds(limit);
  if (ids.length === 0) return listProducts({ statusNot: "unavailable", limit });

  const rows = throwIfError(await db().from("products").select(SELECT_WITH_CATEGORY).in("id", ids));
  const byId = new Map((rows || []).map((row: any) => [row.id, fromDbProduct(row)]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await db().from("products").select(SELECT_WITH_CATEGORY).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromDbProduct(data) : null;
}

// Statut piloté par le stock : disponible dès qu'il y a au moins 1 pièce ; à 0, distingue une
// pièce qui vient de se vendre (Épuisé) d'une pièce jamais approvisionnée (À commander). Les
// états "soon"/"pending" restent volontairement manuels (modération / mise en avant), jamais
// écrasés par le stock.
export function deriveProductStatus(previousStatus: Product["status"] | undefined, stock: number): Product["status"] {
  if (stock >= 1) return "available";
  if (previousStatus === "soon" || previousStatus === "pending") return previousStatus;
  if (previousStatus === "available") return "unavailable";
  return "on_order";
}

async function withDerivedStatus(id: string | null, patch: Record<string, any>): Promise<Record<string, any>> {
  if (patch.stock === undefined || patch.status === "soon" || patch.status === "pending") return patch;
  let previousStatus: Product["status"] | undefined;
  if (id) {
    const { data } = await db().from("products").select("status").eq("id", id).maybeSingle();
    previousStatus = data?.status;
  }
  return { ...patch, status: deriveProductStatus(previousStatus, Number(patch.stock) || 0) };
}

export async function createProduct(patch: Record<string, any>): Promise<Product> {
  const resolved = await withDerivedStatus(null, patch);
  const row = throwIfError(await db().from("products").insert(toDbProduct(resolved)).select(SELECT_WITH_CATEGORY).single());
  return fromDbProduct(row);
}

export async function updateProduct(id: string, patch: Record<string, any>): Promise<Product> {
  const resolved = await withDerivedStatus(id, patch);
  const row = throwIfError(
    await db().from("products").update(toDbProduct(resolved)).eq("id", id).select(SELECT_WITH_CATEGORY).single()
  );
  return fromDbProduct(row);
}

export async function deleteProduct(id: string): Promise<void> {
  throwIfError(await db().from("products").delete().eq("id", id));
}

// Équivalent de insertMany(payload, { ordered: false }) : continue même si une ligne échoue,
// collecte les erreurs au lieu de tout annuler — pas de méthode "insertMany tolérant aux
// erreurs" native côté PostgREST, donc insertion ligne à ligne.
export async function bulkInsertProducts(
  items: Record<string, any>[]
): Promise<{ created: Product[]; errors: { index: number; message: string }[] }> {
  const created: Product[] = [];
  const errors: { index: number; message: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    try {
      created.push(await createProduct(items[i]));
    } catch (err: any) {
      errors.push({ index: i, message: err.message });
    }
  }
  return { created, errors };
}
