import { db, throwIfError } from "./client";

export type User = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "community_manager" | "vendeur" | "custom";
  modules: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

function fromDbUser(row: any): User {
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    modules: row.modules || [],
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FIELD_MAP: Record<string, string> = { passwordHash: "password_hash" };
function toDbUser(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

// Renvoie l'utilisateur complet (avec passwordHash) — à la charge de l'appelant (route API)
// de le retirer avant de répondre au client, comme le faisait .select("-passwordHash").
export async function listUsers(): Promise<User[]> {
  const rows = throwIfError(await db().from("users").select("*").order("created_at", { ascending: false }));
  return (rows || []).map(fromDbUser);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db().from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw error;
  return data ? fromDbUser(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await db().from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromDbUser(data) : null;
}

// Sur doublon d'email, l'erreur Postgres porte le code "23505" (équivalent du code Mongo
// 11000) — à vérifier côté appelant pour renvoyer un message "email déjà utilisé".
export async function createUser(patch: Record<string, any>): Promise<User> {
  const row = throwIfError(await db().from("users").insert(toDbUser(patch)).select("*").single());
  return fromDbUser(row);
}

export async function updateUser(id: string, patch: Record<string, any>): Promise<User> {
  const row = throwIfError(await db().from("users").update(toDbUser(patch)).eq("id", id).select("*").single());
  return fromDbUser(row);
}

export async function deleteUser(id: string): Promise<void> {
  throwIfError(await db().from("users").delete().eq("id", id));
}
