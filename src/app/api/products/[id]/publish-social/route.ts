import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import { publishProductToSocial } from "@/lib/socialPublish";
import { SOCIAL_CHANNELS, parseSocialErrors, type SocialChannel } from "@/lib/socialChannels";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    if (!product.imageUrl) {
      return NextResponse.json({ error: "Ce produit n'a pas de photo principale" }, { status: 400 });
    }

    // Un canal précis = un seul bouton cliqué dans l'admin ; sans body/`channel`, on republie
    // sur tous les canaux (déclenché automatiquement à la validation d'un produit).
    const body = await req.json().catch(() => ({}));
    const requested: SocialChannel[] =
      body?.channel && SOCIAL_CHANNELS.includes(body.channel) ? [body.channel as SocialChannel] : SOCIAL_CHANNELS;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const result = await publishProductToSocial(
      {
        imageUrl: product.imageUrl,
        name: product.name,
        longDesc: (product.longDesc || product.shortDesc) ?? undefined,
        hashtags: product.aiGenerated?.hashtags,
        productUrl: siteUrl ? `${siteUrl}/produit/${id}` : undefined,
      },
      requested
    );

    const socialPostIds = {
      facebook: result.facebookPostId || product.socialPostIds?.facebook,
      instagram: result.instagramPostId || product.socialPostIds?.instagram,
      pinterest: result.pinterestPinId || product.socialPostIds?.pinterest,
    };

    // Erreurs par canal (JSON dans la colonne texte existante) : on ne touche qu'aux entrées
    // des canaux réellement tentés cette fois — un échec Facebook ne doit pas effacer une
    // ancienne erreur Instagram, ni l'inverse.
    const mergedErrors = parseSocialErrors(product.socialPostError);
    for (const channel of requested) {
      if (result.errors[channel]) mergedErrors[channel] = result.errors[channel];
      else delete mergedErrors[channel];
    }

    const anyPublished = !!(socialPostIds.facebook || socialPostIds.instagram || socialPostIds.pinterest);
    const attemptedNow = requested.some((channel) =>
      channel === "facebook" ? !!result.facebookPostId : channel === "instagram" ? !!result.instagramPostId : !!result.pinterestPinId
    );

    const updated = await updateProduct(id, {
      socialPostStatus: anyPublished ? "published" : "failed",
      socialPostedAt: attemptedNow ? new Date().toISOString() : product.socialPostedAt,
      socialPostIds,
      socialPostError: Object.keys(mergedErrors).length ? JSON.stringify(mergedErrors) : null,
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
