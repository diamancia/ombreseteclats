import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

const NOT_FOUND_CODE = "PGRST116";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "commandes")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const o = await getOrderById(id);
  if (!o) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json(o);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "commandes")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const o = await updateOrder(id, { status: body.status });
    return NextResponse.json(o);
  } catch (err: any) {
    if (err.code === NOT_FOUND_CODE) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
