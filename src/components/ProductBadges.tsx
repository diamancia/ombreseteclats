import { effectivePrice, type PricedProduct } from "@/lib/pricing";

// Empilement des rubans visuels sur la photo produit — Nouveau, puis Réduction (-X%) ou Black
// Friday (mutuellement exclusifs, cf. effectivePrice). Le parent doit être `relative` pour que
// le positionnement `absolute` s'applique bien à lui (pas à un ancêtre plus lointain).
export default function ProductBadges({
  product,
}: {
  product: PricedProduct & { isNew?: boolean; gender?: string };
}) {
  const { discountPct, isBlackFriday } = effectivePrice(product);
  const roseGold = product.gender === "femme";

  if (!product.isNew && !discountPct) return null;

  return (
    <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
      {product.isNew && (
        <span
          className={`rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
            roseGold ? "bg-[var(--rose-gold)] text-white" : "bg-[var(--primary)] text-[var(--background)]"
          }`}
        >
          Nouveau
        </span>
      )}
      {discountPct != null &&
        (isBlackFriday ? (
          <span className="rounded bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#e8c46b]">
            Black Friday -{discountPct}%
          </span>
        ) : (
          <span className="rounded bg-red-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
            -{discountPct}%
          </span>
        ))}
    </div>
  );
}
