import { db, throwIfError } from "./client";

export type LandingPage = {
  _id: string;
  slug: string;
  productName: string;
  kicker: string;
  tagline: string;
  images: string[];
  priceOriginal: number;
  priceCurrent: number;
  specs: { label: string; value: string }[];
  ctaLabel: string;
  ctaLink: string;
  startAt?: string | null;
  endAt?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

function fromDbLandingPage(row: any): LandingPage {
  return {
    _id: row.id,
    slug: row.slug,
    productName: row.product_name,
    kicker: row.kicker,
    tagline: row.tagline,
    images: row.images || [],
    priceOriginal: Number(row.price_original),
    priceCurrent: Number(row.price_current),
    specs: row.specs || [],
    ctaLabel: row.cta_label,
    ctaLink: row.cta_link,
    startAt: row.start_at,
    endAt: row.end_at,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FIELD_MAP: Record<string, string> = {
  productName: "product_name",
  priceOriginal: "price_original",
  priceCurrent: "price_current",
  ctaLabel: "cta_label",
  ctaLink: "cta_link",
  startAt: "start_at",
  endAt: "end_at",
};
function toDbLandingPage(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

export async function listLandingPages(): Promise<LandingPage[]> {
  const rows = throwIfError(await db().from("landing_pages").select("*").order("created_at", { ascending: false }));
  return (rows || []).map(fromDbLandingPage);
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const { data, error } = await db().from("landing_pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? fromDbLandingPage(data) : null;
}

export async function createLandingPage(patch: Record<string, any>): Promise<LandingPage> {
  const row = throwIfError(await db().from("landing_pages").insert(toDbLandingPage(patch)).select("*").single());
  return fromDbLandingPage(row);
}

export async function updateLandingPage(id: string, patch: Record<string, any>): Promise<LandingPage> {
  const row = throwIfError(
    await db().from("landing_pages").update(toDbLandingPage(patch)).eq("id", id).select("*").single()
  );
  return fromDbLandingPage(row);
}

export async function deleteLandingPage(id: string): Promise<void> {
  throwIfError(await db().from("landing_pages").delete().eq("id", id));
}
