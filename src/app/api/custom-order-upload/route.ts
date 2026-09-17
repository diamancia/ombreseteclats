import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadFile } from "@/lib/imageStorage";
import { siteConfig } from "@/site.config";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic"]);

// Public, sans auth : sert uniquement à joindre une photo d'inspiration au formulaire
// sur-mesure (client anonyme, pas de session admin). Clé dédiée "custom-orders/" pour
// distinguer ces fichiers des photos produit, extension whitelistée par prudence.
export async function POST(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("filename") || "";
  const ext = (filename.split(".").pop() || "jpg").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 400 });
  }
  const key = `${siteConfig.brand.storagePrefix}/custom-orders/${randomUUID()}.${ext}`;
  const contentType = req.headers.get("content-type") || "application/octet-stream";
  try {
    const bytes = Buffer.from(await req.arrayBuffer());
    const url = await uploadFile(key, bytes, contentType);
    return NextResponse.json({ url, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Échec de l'upload" }, { status: 500 });
  }
}
