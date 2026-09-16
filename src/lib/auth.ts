import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PermissionKey } from "@/lib/modules";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env variable");
}
const JWT_SECRET = process.env.JWT_SECRET as string;

// Le superadmin historique (mot de passe unique Settings.adminPassword) a toujours accès à tout.
type SuperadminPayload = { role: "admin" };
type UserPayload = { userId: string; role: string; modules: PermissionKey[] };
export type AuthPayload = SuperadminPayload | UserPayload;

function isSuperadmin(payload: AuthPayload): payload is SuperadminPayload {
  return payload.role === "admin" && !("userId" in payload);
}

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
}

export function signUserToken(user: { id: string; role: string; modules: PermissionKey[] }) {
  return jwt.sign(
    { userId: user.id, role: user.role, modules: user.modules },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

function decode(req: NextRequest): AuthPayload | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Vérifie qu'une requête est authentifiée et, si `requiredModule` est fourni, que
 * l'utilisateur a accès à ce module. Le superadmin historique passe toujours.
 * Retourne le payload (utile pour identifier l'auteur) ou null si refusé.
 */
export function verifyUser(req: NextRequest, requiredModule?: PermissionKey): AuthPayload | null {
  const payload = decode(req);
  if (!payload) return null;
  if (isSuperadmin(payload)) return payload;
  if (!requiredModule) return payload;
  return payload.modules.includes(requiredModule) ? payload : null;
}

export function currentUserId(req: NextRequest): string | null {
  const payload = decode(req);
  if (!payload || isSuperadmin(payload)) return null;
  return payload.userId;
}
