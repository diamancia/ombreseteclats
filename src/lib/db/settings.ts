import { db, throwIfError } from "./client";

// Ligne unique à id fixe (voir supabase/migrations/0001_init.sql) — remplace la convention
// Mongoose "premier document trouvé" par une vraie contrainte de singleton.
export const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export type Settings = {
  _id: string;
  brandName?: string | null;
  brandTagline?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  zone?: string | null;
  address?: string | null;
  adminPassword: string;
  slots: string[];
  openWeekdays: number[];
  closedDates: string[];
  minDelay?: number | null;
  about?: string | null;
  cgv?: string | null;
  rgpd?: string | null;
  cookiesPolicy?: string | null;
  socialAutoPublish: boolean;
  navLinks: { href: string; label: string }[];
  socialLinks: { platform: string; url: string; active?: boolean; showInHeader?: boolean }[];
  announcements: any[];
  bannerEnabled: boolean;
  bannerType: "photo" | "video";
  bannerSize: "compacte" | "standard" | "pleine";
  bannerUrl?: string | null;
  bannerLink?: string | null;
  moduleFlags: Record<string, boolean>;
  metalTypes: { key: string; label: string }[];
  goldColors: { key: string; label: string; hex: string }[];
  chainLengthPricing: { refCm: number; pricePerCm: number };
  createdAt: string;
  updatedAt: string;
};

function fromDbSettings(row: any): Settings {
  return {
    _id: row.id,
    brandName: row.brand_name,
    brandTagline: row.brand_tagline,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroImageUrl: row.hero_image_url,
    email: row.email,
    phone: row.phone,
    zone: row.zone,
    address: row.address,
    adminPassword: row.admin_password,
    slots: row.slots || [],
    openWeekdays: row.open_weekdays || [],
    closedDates: row.closed_dates || [],
    minDelay: row.min_delay,
    about: row.about,
    cgv: row.cgv,
    rgpd: row.rgpd,
    cookiesPolicy: row.cookies_policy,
    socialAutoPublish: row.social_auto_publish,
    navLinks: row.nav_links || [],
    socialLinks: row.social_links || [],
    announcements: row.announcements || [],
    bannerEnabled: row.banner_enabled,
    bannerType: row.banner_type,
    bannerSize: row.banner_size,
    bannerUrl: row.banner_url,
    bannerLink: row.banner_link,
    // Ancien Settings.moduleFlags (type Map + toObject/toJSON flattenMaps côté Mongoose) —
    // jsonb est déjà un objet plain ici, le flattening manuel n'est plus nécessaire.
    moduleFlags: row.module_flags || {},
    metalTypes: row.metal_types || [],
    goldColors: row.gold_colors || [],
    chainLengthPricing: row.chain_length_pricing || { refCm: 40, pricePerCm: 5 },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FIELD_MAP: Record<string, string> = {
  brandName: "brand_name",
  brandTagline: "brand_tagline",
  heroTitle: "hero_title",
  heroSubtitle: "hero_subtitle",
  heroImageUrl: "hero_image_url",
  adminPassword: "admin_password",
  openWeekdays: "open_weekdays",
  closedDates: "closed_dates",
  minDelay: "min_delay",
  cookiesPolicy: "cookies_policy",
  socialAutoPublish: "social_auto_publish",
  navLinks: "nav_links",
  socialLinks: "social_links",
  bannerEnabled: "banner_enabled",
  bannerType: "banner_type",
  bannerSize: "banner_size",
  bannerUrl: "banner_url",
  bannerLink: "banner_link",
  moduleFlags: "module_flags",
  metalTypes: "metal_types",
  goldColors: "gold_colors",
  chainLengthPricing: "chain_length_pricing",
};
function toDbSettings(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await db().from("settings").select("*").eq("id", SETTINGS_ID).maybeSingle();
  if (error) throw error;
  return data ? fromDbSettings(data) : null;
}

// Équivalent de Settings.findOneAndUpdate({}, updates, {upsert:true}) — mais aussi du
// Settings.create({...}) initial du seed, puisque la ligne singleton existe ou non selon
// l'état de la base.
export async function upsertSettings(patch: Record<string, any>): Promise<Settings> {
  const row = throwIfError(
    await db()
      .from("settings")
      .upsert({ id: SETTINGS_ID, ...toDbSettings(patch) }, { onConflict: "id" })
      .select("*")
      .single()
  );
  return fromDbSettings(row);
}
