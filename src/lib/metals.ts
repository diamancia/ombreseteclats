// Métal et couleur d'or — attribut structuré par produit (remplace l'ancien système de
// "finition" en texte libre pour cet usage précis). Éditable depuis Paramètres > Métaux,
// donc pas un enum figé dans le code : ajouter/retirer un métal ou une couleur se fait
// en base, sans déploiement.

export type MetalType = { key: string; label: string };
export type GoldColor = { key: string; label: string; hex: string };

// Par défaut, seuls les deux titrages réellement utilisés par la boutique — "Perles" reste
// ajoutable manuellement depuis Paramètres > Métaux si besoin un jour (clés inchangées, donc
// aucune migration de données pour les produits existants).
export const DEFAULT_METAL_TYPES: MetalType[] = [
  { key: "or", label: "Or 18 carats" },
  { key: "argent", label: "Argent 925" },
];

// Icônes de couleur uniquement (pas de texte) sur les fiches produit — cf. demande :
// un simple rond de couleur suffit à comprendre la teinte d'or.
export const DEFAULT_GOLD_COLORS: GoldColor[] = [
  { key: "jaune", label: "Or jaune", hex: "#E8C46B" },
  { key: "rose", label: "Or rose", hex: "#C9A08A" },
  { key: "blanc", label: "Or blanc", hex: "#D9D9D9" },
];
