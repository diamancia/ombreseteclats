import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton mis en cache sur globalThis — même précaution que l'ancien connectDb() de
// Mongoose (src/lib/mongoose.ts) : survit au hot-reload de Next.js en dev et évite de
// recréer un client à chaque invocation en serverless. Clé service_role côté serveur
// uniquement (bypass RLS) — jamais exposée au client, jamais préfixée NEXT_PUBLIC_.
declare global {
  // eslint-disable-next-line no-var
  var _supabase: SupabaseClient | undefined;
}

export function db(): SupabaseClient {
  if (global._supabase) return global._supabase;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variable");
  }

  global._supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return global._supabase;
}

// Lève une erreur lisible côté appelant plutôt que de laisser passer un objet Postgres brut —
// même esprit que les catch génériques déjà utilisés dans les routes API existantes.
export function throwIfError<T>({ data, error }: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (error) throw new DbError(error.message, error.code);
  return data as T;
}

export class DbError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "DbError";
    this.code = code;
  }
}
