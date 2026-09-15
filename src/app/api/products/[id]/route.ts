import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

const NOT_FOUND_CODE = "PGRST116";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProductById(id);
  if (!p) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const p = await updateProduct(id, body);
    return NextResponse.json(p);
  } catch (err: any) {
    if (err.code === NOT_FOUND_CODE) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    await deleteProduct(id);
    return NextResponse.json({ message: "Produit supprimé" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
