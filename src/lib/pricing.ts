// Calcul du prix réellement affiché/facturé pour un produit — pure, sans dépendance serveur,
// donc importable aussi bien depuis des Server Components que des composants client
// (AddToCartButton, ProductOrderForm) et la route de paiement (api/checkout).

export type PricedProduct = {
  basePrice: number;
  isPromo?: boolean;
  discountPct?: number;
  isBlackFriday?: boolean;
  promoEndsAt?: string | null;
};

export type PriceResult = {
  price: number;
  originalPrice: number | null;
  discountPct: number | null;
  isBlackFriday: boolean;
};

// Un seul pourcentage actif à la fois : Black Friday prioritaire tant que son compte à rebours
// n'est pas dépassé, sinon la réduction manuelle (isPromo) si elle est cochée.
export function effectivePrice(product: PricedProduct): PriceResult {
  const blackFridayActive =
    !!product.isBlackFriday && (!product.promoEndsAt || new Date(product.promoEndsAt) > new Date());
  const active = blackFridayActive || (!!product.isPromo && (product.discountPct || 0) > 0);
  if (!active || !product.discountPct) {
    return { price: product.basePrice, originalPrice: null, discountPct: null, isBlackFriday: false };
  }
  const price = Math.round(product.basePrice * (1 - product.discountPct / 100) * 100) / 100;
  return { price, originalPrice: product.basePrice, discountPct: product.discountPct, isBlackFriday: blackFridayActive };
}
