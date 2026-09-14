import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Product } from "@/lib/models";
import { verifyAdmin } from "@/lib/auth";
import { publishProductToSocial } from "@/lib/socialPublish";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const { id } = await params;
  try {
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    if (!product.imageUrl) {
      return NextResponse.json({ error: "Ce produit n'a pas de photo principale" }, { status: 400 });
    }

    const result = await publishProductToSocial({
      imageUrl: product.imageUrl,
      name: product.name,
      longDesc: (product.longDesc || product.shortDesc) ?? undefined,
      hashtags: product.aiGenerated?.hashtags,
    });

    const published = !!(result.facebookPostId || result.instagramPostId);
    product.socialPostStatus = published ? "published" : "failed";
    product.socialPostedAt = published ? new Date() : product.socialPostedAt;
    product.socialPostIds = {
      facebook: result.facebookPostId || product.socialPostIds?.facebook,
      instagram: result.instagramPostId || product.socialPostIds?.instagram,
    };
    product.socialPostError = result.errors.length ? result.errors.join(" · ") : undefined;
    await product.save();

    return NextResponse.json({
      status: product.socialPostStatus,
      facebookPostId: result.facebookPostId,
      instagramPostId: result.instagramPostId,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
