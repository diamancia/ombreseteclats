import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Vérifie la connexion Supabase avec une requête légère plutôt que d'énumérer les tables
// (PostgREST n'a pas d'équivalent direct à listCollections()) — la liste des tables est de
// toute façon fixe et connue (voir supabase/migrations/0001_init.sql).
const TABLES = [
  "users",
  "notifications",
  "categories",
  "products",
  "orders",
  "settings",
  "landing_pages",
  "google_reviews_cache",
];

export async function GET() {
  try {
    const { error } = await db().from("settings").select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      status: "ok",
      database: "supabase",
      tables: TABLES,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ status: "error", message: (error as Error).message }, { status: 500 });
  }
}
