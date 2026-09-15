"use client";
import { processImage } from "./imageProcess";

// Upload public (sans JWT admin) pour la pièce jointe du formulaire sur-mesure — même
// pipeline de compression que côté admin (src/lib/adminClient.ts), route API séparée.
export async function uploadCustomOrderImage(file: File): Promise<string> {
  const processed = await processImage(file, { maxDim: 1600, quality: 0.85, square: false });
  const res = await fetch("/api/custom-order-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: processed.name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Échec de la demande d'upload");
  }
  const presign = await res.json();
  const put = await fetch(presign.uploadUrl, { method: "PUT", body: processed });
  if (!put.ok) throw new Error("Échec upload");
  return presign.url as string;
}
