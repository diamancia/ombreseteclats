import { db, throwIfError } from "./client";

export type Category = {
  _id: string;
  name: string;
  emoji: string;
  imageUrl: string;
  active: boolean;
  gender?: "homme" | "femme" | "mixte" | null;
  parent?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function fromDbCategory(row: any): Category {
  return {
    _id: row.id,
    name: row.name,
    emoji: row.emoji,
    imageUrl: row.image_url,
    active: row.active,
    gender: row.gender,
    parent: row.parent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FIELD_MAP: Record<string, string> = {
  imageUrl: "image_url",
  parent: "parent_id",
};
function toDbCategory(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

export async function listCategories(opts: { activeOnly?: boolean; topLevelOnly?: boolean } = {}): Promise<Category[]> {
  let q = db().from("categories").select("*").order("name", { ascending: true });
  if (opts.activeOnly) q = q.eq("active", true);
  if (opts.topLevelOnly) q = q.is("parent_id", null);
  const rows = throwIfError(await q);
  return (rows || []).map(fromDbCategory);
}

export async function createCategory(patch: Record<string, any>): Promise<Category> {
  const row = throwIfError(await db().from("categories").insert(toDbCategory(patch)).select("*").single());
  return fromDbCategory(row);
}

export async function updateCategory(id: string, patch: Record<string, any>): Promise<Category> {
  const row = throwIfError(await db().from("categories").update(toDbCategory(patch)).eq("id", id).select("*").single());
  return fromDbCategory(row);
}

export async function deleteCategory(id: string): Promise<void> {
  throwIfError(await db().from("categories").delete().eq("id", id));
}
