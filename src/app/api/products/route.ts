import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    const p = await createProduct(body);
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
