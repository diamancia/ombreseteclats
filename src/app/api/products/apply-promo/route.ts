import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

// Mise à jour en masse pour le module Promotions/Black Friday : applique (ou retire) le badge
// et la réduction sur tous les produits sélectionnés en une fois, sans passer par la modale
// produit unitaire. Pas de table "campaigns" séparée — juste un patch appliqué à chaque produit.
export async function POST(req: NextRequest) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { ids, isBlackFriday, discountPct, hours } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Aucun produit sélectionné" }, { status: 400 });
  }

  const patch = isBlackFriday
    ? {
        isBlackFriday: true,
        discountPct: Math.max(0, Math.min(100, Number(discountPct) || 0)),
        promoEndsAt: hours ? new Date(Date.now() + Number(hours) * 3600 * 1000).toISOString() : null,
      }
    : { isBlackFriday: false, discountPct: 0, promoEndsAt: null };

  const results = await Promise.allSettled(ids.map((id: string) => updateProduct(id, patch)));
  const errors = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({ updated: ids.length - errors, errors });
}
