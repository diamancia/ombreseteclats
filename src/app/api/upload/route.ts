import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUploadUrl, publicUrl } from "@/lib/r2";
import { verifyUser } from "@/lib/auth";
import { siteConfig } from "@/site.config";

export async function POST(req: NextRequest) {
  // Infrastructure partagée par plusieurs écrans (produits, catégories, paramètres) : on exige
  // seulement une session valide, pas un module précis.
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { filename } = await req.json().catch(() => ({}));
  const ext = (filename?.split(".").pop() || "jpg").toLowerCase();
  const key = `${siteConfig.brand.storagePrefix}/${randomUUID()}.${ext}`;
  const uploadUrl = await getUploadUrl(key);
  return NextResponse.json({ uploadUrl, url: publicUrl(key), key });
}
