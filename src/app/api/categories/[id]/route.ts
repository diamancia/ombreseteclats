import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

// PGRST116 = "no rows returned" par .single() — équivalent du findByIdAndUpdate/Delete qui
// renvoyait null sur Mongoose quand l'id n'existe pas.
const NOT_FOUND_CODE = "PGRST116";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "categories")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const c = await updateCategory(id, body);
    return NextResponse.json(c);
  } catch (err: any) {
    if (err.code === NOT_FOUND_CODE) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "categories")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    await deleteCategory(id);
    return NextResponse.json({ message: "Catégorie supprimée" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
