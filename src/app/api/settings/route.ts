import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSettings, upsertSettings } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import { siteConfig } from "@/site.config";
import { DEFAULT_MODULE_FLAGS } from "@/lib/modules";
import { DEFAULT_METAL_TYPES, DEFAULT_GOLD_COLORS } from "@/lib/metals";

export async function GET() {
  const s = await getSettings();
  if (!s) {
    return NextResponse.json({
      brandName: siteConfig.brand.name,
      brandTagline: siteConfig.brand.tagline,
      heroTitle: siteConfig.hero.defaultTitle,
      heroSubtitle: siteConfig.hero.defaultSubtitle,
      heroImageUrl: siteConfig.hero.defaultImageUrl,
      slots: siteConfig.defaults.slots,
      openWeekdays: siteConfig.defaults.openWeekdays,
      minDelay: siteConfig.defaults.minDelay,
      address: "14 rue des Orfèvres, 75001 Paris",
      socialAutoPublish: true,
      navLinks: siteConfig.navbar.links,
      socialLinks: [],
      announcements: [],
      bannerEnabled: false,
      bannerType: "photo",
      bannerSize: "standard",
      moduleFlags: DEFAULT_MODULE_FLAGS,
      metalTypes: DEFAULT_METAL_TYPES,
      goldColors: DEFAULT_GOLD_COLORS,
      chainLengthPricing: { refCm: 40, pricePerCm: 5 },
    });
  }
  const { adminPassword, ...obj } = s;
  return NextResponse.json(obj);
}

export async function PUT(req: NextRequest) {
  if (!verifyUser(req, "parametres")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const updates: any = await req.json();
    if (updates.adminPassword && updates.adminPassword.length > 0) {
      updates.adminPassword = await bcrypt.hash(updates.adminPassword, 10);
    } else {
      delete updates.adminPassword;
    }
    const s = await upsertSettings(updates);
    const { adminPassword, ...obj } = s;
    return NextResponse.json(obj);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
