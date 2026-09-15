import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { listUsers, createUser } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import { ROLE_PRESETS, UserRole } from "@/lib/modules";

export async function GET(req: NextRequest) {
  if (!verifyUser(req, "utilisateurs")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const users = await listUsers();
  return NextResponse.json(users.map(({ passwordHash, ...u }) => u));
}

export async function POST(req: NextRequest) {
  if (!verifyUser(req, "utilisateurs")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, email, password, role, modules } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nom, email et mot de passe requis" }, { status: 400 });
    }
    const finalRole: UserRole = role || "custom";
    const finalModules = Array.isArray(modules) ? modules : ROLE_PRESETS[finalRole as UserRole] || [];
    const user = await createUser({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: finalRole,
      modules: finalModules,
      active: true,
    });
    const { passwordHash, ...obj } = user;
    return NextResponse.json(obj, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}
