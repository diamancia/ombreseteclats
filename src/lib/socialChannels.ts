// Partagé entre l'API (route publish-social) et l'admin (affichage des 3 boutons séparés) —
// ne contient aucune logique d'appel réseau, donc importable côté client sans embarquer les
// implémentations Graph API / Pinterest dans le bundle.

export type SocialChannel = "facebook" | "instagram" | "pinterest";

export const SOCIAL_CHANNELS: SocialChannel[] = ["facebook", "instagram", "pinterest"];

export const SOCIAL_CHANNEL_LABELS: Record<SocialChannel, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  pinterest: "Pinterest",
};

// `socialPostError` reste une colonne texte unique (pas de migration) : on y stocke un JSON
// { [channel]: message } pour garder une erreur par canal plutôt qu'un message global qui
// écraserait les autres à chaque clic sur un bouton différent.
export function parseSocialErrors(raw?: string | null): Partial<Record<SocialChannel, string>> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
