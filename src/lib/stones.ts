// Pierres — l'attribut existe déjà par produit (`product.stone`, saisi dans l'admin via
// ProductAttributesFields). Ce module en fait une dimension de navigation : un libellé
// public par nature, un filtre catalogue (`?pierre=`) et un résumé du stock réellement
// disponible, pour que la vitrine "Nos pierres naturelles" ne montre jamais du vide.

export type StoneNature = "naturelle" | "synthetique" | "diamant";

export const STONE_NATURES: StoneNature[] = ["naturelle", "synthetique", "diamant"];

export const STONE_NATURE_LABELS: Record<StoneNature, string> = {
  naturelle: "Pierre naturelle",
  synthetique: "Pierre synthétique",
  diamant: "Diamant",
};

export function isStoneNature(value?: string | null): value is StoneNature {
  return !!value && (STONE_NATURES as string[]).includes(value);
}

// Description lisible d'une pierre pour l'affichage client ("Onyx, taille ovale · 1.2 ct").
export function describeStone(stone?: any): string {
  if (!stone) return "";
  const shape = stone.shape ? `taille ${stone.shape}` : null;
  const carats = stone.carats ? `${stone.carats} ct` : null;
  const nature: string | undefined = stone.nature;
  const head = stone.centralDescription?.trim() || (isStoneNature(nature) ? STONE_NATURE_LABELS[nature] : null);
  return [head, shape, carats].filter(Boolean).join(" · ");
}

export function hasStone(product: any): boolean {
  const stone = product?.stone;
  return !!stone && (!!stone.nature || !!stone.shape || !!stone.carats || !!stone.centralDescription);
}

// Nombre de pièces disponibles par nature de pierre — alimente les puces de la vitrine.
export function countStonesByNature(products: any[]): { nature: StoneNature; label: string; count: number }[] {
  return STONE_NATURES.map((nature) => ({
    nature,
    label: STONE_NATURE_LABELS[nature],
    count: products.filter((p) => p.stone?.nature === nature).length,
  })).filter((entry) => entry.count > 0);
}
