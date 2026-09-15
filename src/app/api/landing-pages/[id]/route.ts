import { NextRequest, NextResponse } from "next/server";
import { updateLandingPage, deleteLandingPage } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const p = await updateLandingPage(id, body);
    return NextResponse.json(p);
  } catch (err: any) {
    if (err.code === "PGRST116") return NextResponse.json({ error: "Landing page introuvable" }, { status: 404 });
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    await deleteLandingPage(id);
    return NextResponse.json({ message: "Landing page supprimée" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
