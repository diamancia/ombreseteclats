import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Product } from "@/lib/models";
import { verifyAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Aucun produit à importer" }, { status: 400 });
    }
    const payload = items.map((item: any) => ({ ...item, status: "pending" }));
    const created = await Product.insertMany(payload, { ordered: false });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
