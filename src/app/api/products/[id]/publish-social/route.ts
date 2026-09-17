import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import { publishProductToSocial } from "@/lib/socialPublish";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    if (!product.imageUrl) {
      return NextResponse.json({ error: "Ce produit n'a pas de photo principale" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const result = await publishProductToSocial({
      imageUrl: product.imageUrl,
      name: product.name,
      longDesc: (product.longDesc || product.shortDesc) ?? undefined,
      hashtags: product.aiGenerated?.hashtags,
      productUrl: siteUrl ? `${siteUrl}/produit/${id}` : undefined,
    });

    const published = !!(result.facebookPostId || result.instagramPostId || result.pinterestPinId);
    const socialPostStatus = published ? "published" : "failed";
    const updated = await updateProduct(id, {
      socialPostStatus,
      socialPostedAt: published ? new Date().toISOString() : product.socialPostedAt,
      socialPostIds: {
        facebook: result.facebookPostId || product.socialPostIds?.facebook,
        instagram: result.instagramPostId || product.socialPostIds?.instagram,
        pinterest: result.pinterestPinId || product.socialPostIds?.pinterest,
      },
      socialPostError: result.errors.length ? result.errors.join(" · ") : undefined,
    });

    return NextResponse.json({
      status: updated.socialPostStatus,
      facebookPostId: result.facebookPostId,
      instagramPostId: result.instagramPostId,
      pinterestPinId: result.pinterestPinId,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
