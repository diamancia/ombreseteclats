"use client";
import { processImage } from "./imageProcess";

// Upload public (sans JWT admin) pour la pièce jointe du formulaire sur-mesure — même
// pipeline de compression que côté admin (src/lib/adminClient.ts), route API séparée.
export async function uploadCustomOrderImage(file: File): Promise<string> {
  const processed = await processImage(file, { maxDim: 1600, quality: 0.85, square: false });
  const res = await fetch(`/api/custom-order-upload?filename=${encodeURIComponent(processed.name)}`, {
    method: "POST",
    headers: { "Content-Type": processed.type || "application/octet-stream" },
    body: processed,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Échec de l'upload");
  }
  const { url } = await res.json();
  return url as string;
}
