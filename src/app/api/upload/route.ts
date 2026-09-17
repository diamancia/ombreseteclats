import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadFile } from "@/lib/imageStorage";
import { verifyUser } from "@/lib/auth";
import { siteConfig } from "@/site.config";

export async function POST(req: NextRequest) {
  // Infrastructure partagée par plusieurs écrans (produits, catégories, paramètres) : on exige
  // seulement une session valide, pas un module précis.
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const filename = req.nextUrl.searchParams.get("filename") || "";
  const ext = (filename.split(".").pop() || "jpg").toLowerCase();
  const key = `${siteConfig.brand.storagePrefix}/${randomUUID()}.${ext}`;
  const contentType = req.headers.get("content-type") || "application/octet-stream";
  try {
    const bytes = Buffer.from(await req.arrayBuffer());
    const url = await uploadFile(key, bytes, contentType);
    return NextResponse.json({ url, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Échec de l'upload" }, { status: 500 });
  }
}
