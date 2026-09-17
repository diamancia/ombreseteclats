import { effectivePrice, type PricedProduct } from "@/lib/pricing";

type Badge = { key: string; label: string; className: string };
type BadgeProduct = PricedProduct & { isNew?: boolean; gender?: string };

// Un seul badge à la fois sur la photo (pour ne jamais cacher le bijou) : Black Friday >
// Réduction > Nouveau, dans cet ordre de priorité marketing. Le second, s'il y en a un, se
// rend en petit texte sous la photo via <ProductSecondaryBadge>, jamais empilé dessus.
export function pickProductBadges(product: BadgeProduct): { primary: Badge | null; secondary: Badge | null } {
  const { discountPct, isBlackFriday } = effectivePrice(product);
  const roseGold = product.gender === "femme";
  const flags: Badge[] = [];

  if (isBlackFriday && discountPct != null) {
    flags.push({ key: "bf", label: `Black Friday -${discountPct}%`, className: "bg-black text-[#e8c46b]" });
  } else if (discountPct != null) {
    flags.push({ key: "promo", label: `-${discountPct}%`, className: "bg-red-600 text-white" });
  }
  if (product.isNew) {
    flags.push({
      key: "new",
      label: "Nouveau",
      className: roseGold ? "bg-[var(--rose-gold)] text-white" : "bg-[var(--primary)] text-[var(--background)]",
    });
  }

  return { primary: flags[0] || null, secondary: flags[1] || null };
}

// Ruban sur la photo — le parent doit être `relative` pour que le positionnement `absolute`
// s'applique bien à lui (pas à un ancêtre plus lointain).
export default function ProductBadges({ product }: { product: BadgeProduct }) {
  const { primary } = pickProductBadges(product);
  if (!primary) return null;

  return (
    <div className="absolute left-2 top-2 z-10">
      <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${primary.className}`}>
        {primary.label}
      </span>
    </div>
  );
}

// Second badge (s'il y en a un) — affiché en dehors de la photo, jamais superposé.
export function ProductSecondaryBadge({ product, className = "" }: { product: BadgeProduct; className?: string }) {
  const { secondary } = pickProductBadges(product);
  if (!secondary) return null;

  return (
    <span className={`inline-block w-fit rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${secondary.className} ${className}`}>
      {secondary.label}
    </span>
  );
}
