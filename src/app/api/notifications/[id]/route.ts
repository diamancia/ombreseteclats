import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Notification } from "@/lib/models";
import { verifyUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const n = await Notification.findByIdAndUpdate(id, { read: body.read !== false }, { new: true });
  if (!n) return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
  return NextResponse.json(n);
}
