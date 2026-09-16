import { NextRequest, NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  const cats = await listCategories(all ? {} : { activeOnly: true });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!verifyUser(req, "categories")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    const c = await createCategory(body);
    return NextResponse.json(c, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
