import { db } from "@/lib/db/client";

// Bucket Supabase Storage (public en lecture) créé manuellement dans le dashboard Supabase —
// remplace Cloudflare R2 : mêmes identifiants que la base de données, pas de compte séparé.
const BUCKET = "product-images";

// Upload direct côté serveur (clé service_role, bypass RLS) : le client envoie les octets déjà
// compressés (voir src/lib/imageProcess.ts) directement à notre route API, qui les transfère
// elle-même à Supabase Storage — plus simple et plus robuste que le couple presign-URL + PUT
// utilisé par le SDK S3 de Cloudflare R2 (abandonné : jamais configuré, plantait sans message
// d'erreur clair).
export async function uploadFile(key: string, bytes: Buffer, contentType: string): Promise<string> {
  const { error } = await db().storage.from(BUCKET).upload(key, bytes, { contentType, upsert: true });
  if (error) {
    throw new Error(
      `Échec de l'upload vers Supabase Storage (bucket "${BUCKET}"): ${error.message}`
    );
  }
  const { data } = db().storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}
