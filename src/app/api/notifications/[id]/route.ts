import { NextRequest, NextResponse } from "next/server";
import { updateNotification } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const n = await updateNotification(id, { read: body.read !== false });
    return NextResponse.json(n);
  } catch (err: any) {
    if (err.code === "PGRST116") return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
