// Lien Google Maps direct construit à partir de l'adresse texte — aucune clé API nécessaire
// (contrairement à l'embed `maps/embed/v1`). Se met à jour automatiquement si l'adresse change
// dans Paramètres, sans dépendre d'un lien saisi à part.
export function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
