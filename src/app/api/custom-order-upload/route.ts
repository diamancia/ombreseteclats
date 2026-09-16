import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUploadUrl, publicUrl } from "@/lib/r2";
import { siteConfig } from "@/site.config";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic"]);

// Public, sans auth : sert uniquement à joindre une photo d'inspiration au formulaire
// sur-mesure (client anonyme, pas de session admin). Clé dédiée "custom-orders/" pour
// distinguer ces fichiers des photos produit dans R2, extension whitelistée par prudence.
export async function POST(req: NextRequest) {
  const { filename } = await req.json().catch(() => ({}));
  const ext = (filename?.split(".").pop() || "jpg").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 400 });
  }
  const key = `${siteConfig.brand.storagePrefix}/custom-orders/${randomUUID()}.${ext}`;
  const uploadUrl = await getUploadUrl(key);
  return NextResponse.json({ uploadUrl, url: publicUrl(key), key });
}
