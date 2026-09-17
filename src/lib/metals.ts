// Métal et couleur d'or — attribut structuré par produit (remplace l'ancien système de
// "finition" en texte libre pour cet usage précis). Éditable depuis Paramètres > Métaux,
// donc pas un enum figé dans le code : ajouter/retirer un métal ou une couleur se fait
// en base, sans déploiement.

export type MetalType = { key: string; label: string };
export type GoldColor = { key: string; label: string; hex: string };

// Titrages d'or homologués les plus courants en bijouterie (9, 14, 18, 22, 24 carats) + argent
// 925, plutôt que de devoir taper chaque titrage à la main. La clé "or" (= 18 carats) reste
// inchangée pour ne rien casser sur les produits déjà en base ; les autres sont de nouvelles
// entrées. "Perles" reste ajoutable manuellement depuis Paramètres > Métaux si besoin un jour.
export const DEFAULT_METAL_TYPES: MetalType[] = [
  { key: "or9", label: "Or 9 carats" },
  { key: "or14", label: "Or 14 carats" },
  { key: "or", label: "Or 18 carats" },
  { key: "or22", label: "Or 22 carats" },
  { key: "or24", label: "Or 24 carats" },
  { key: "argent", label: "Argent 925" },
];

// Icônes de couleur uniquement (pas de texte) sur les fiches produit — cf. demande :
// un simple rond de couleur suffit à comprendre la teinte d'or.
export const DEFAULT_GOLD_COLORS: GoldColor[] = [
  { key: "jaune", label: "Or jaune", hex: "#E8C46B" },
  { key: "rose", label: "Or rose", hex: "#C9A08A" },
  { key: "blanc", label: "Or blanc", hex: "#D9D9D9" },
];
