import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { LandingPage } from "@/lib/models";
import { verifyUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const { id } = await params;
  try {
    const body = await req.json();
    const p = await LandingPage.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!p) return NextResponse.json({ error: "Landing page introuvable" }, { status: 404 });
    return NextResponse.json(p);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const { id } = await params;
  const p = await LandingPage.findByIdAndDelete(id);
  if (!p) return NextResponse.json({ error: "Landing page introuvable" }, { status: 404 });
  return NextResponse.json({ message: "Landing page supprimée" });
}
