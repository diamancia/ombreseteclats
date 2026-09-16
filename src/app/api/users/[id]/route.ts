import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { updateUser, deleteUser } from "@/lib/db";
import { currentUserId, verifyUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "utilisateurs")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const updates: Record<string, any> = {
      name: body.name,
      role: body.role,
      modules: body.modules,
      active: body.active,
    };
    if (body.password) {
      updates.passwordHash = await bcrypt.hash(body.password, 10);
    }
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);
    const user = await updateUser(id, updates);
    const { passwordHash, ...obj } = user;
    return NextResponse.json(obj);
  } catch (err: any) {
    if (err.code === "PGRST116") return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyUser(req, "utilisateurs")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  if (currentUserId(req) === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }
  try {
    await deleteUser(id);
    return NextResponse.json({ message: "Utilisateur supprimé" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
