import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/mongoose";
import { Settings, User } from "@/lib/models";
import { signAdminToken, signUserToken } from "@/lib/auth";
import { ROLE_PRESETS } from "@/lib/modules";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!password) return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });

  await connectDb();

  // Pas d'email saisi : connexion avec le mot de passe superadmin historique (compte unique).
  if (!email) {
    const s = await Settings.findOne();
    if (!s) return NextResponse.json({ error: "Configuration introuvable. Lancez /api/seed" }, { status: 500 });
    const valid = await bcrypt.compare(password, s.adminPassword);
    if (!valid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    return NextResponse.json({
      token: signAdminToken(),
      message: "Connexion réussie",
      user: { name: "Superadmin", role: "admin", modules: ROLE_PRESETS.admin },
    });
  }

  // Email saisi : connexion en tant qu'utilisateur créé par le superadmin (Phase 5).
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.active) return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });

  const modules = user.role === "admin" ? ROLE_PRESETS.admin : user.modules;
  return NextResponse.json({
    token: signUserToken({ id: user._id.toString(), role: user.role, modules: modules as any }),
    message: "Connexion réussie",
    user: { name: user.name, role: user.role, modules },
  });
}
