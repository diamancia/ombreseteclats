import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { LandingPage } from "@/lib/models";
import { verifyUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const pages = await LandingPage.find().sort({ createdAt: -1 });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  if (!verifyUser(req, "produits")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  try {
    const body = await req.json();
    const p = await LandingPage.create(body);
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
