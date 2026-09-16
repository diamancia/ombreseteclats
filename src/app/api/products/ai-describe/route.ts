import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import { generateProductDescription } from "@/lib/ai";

export async function POST(req: NextRequest) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { imageUrl, jewelryType, stoneDescription } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "imageUrl requis" }, { status: 400 });
    const result = await generateProductDescription(imageUrl, { jewelryType, stoneDescription });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
