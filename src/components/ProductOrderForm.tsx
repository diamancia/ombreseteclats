"use client";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartProvider";
import { siteConfig } from "@/site.config";

const V1 = siteConfig.product.variant1;

const DEFAULT_PRICING = { refCm: 40, pricePerCm: 5 };

export default function ProductOrderForm({
  product,
  pricingRule,
}: {
  product: any;
  pricingRule?: { refCm: number; pricePerCm: number };
}) {
  const { addToCart } = useCart();
  const [flavor, setFlavor] = useState(product.flavors?.[0] || null);
  const cl = product.customLength;
  const presets: number[] = cl?.presets?.length ? cl.presets : [39, 42];
  const [lengthMode, setLengthMode] = useState<"preset" | "custom">("preset");
  const [lengthCm, setLengthCm] = useState<number>(presets[0]);
  const [customCm, setCustomCm] = useState<string>("");
  const [qty, setQty] = useState(1);
  const rule = pricingRule || DEFAULT_PRICING;

  const effectiveLengthCm =
    cl?.enabled && lengthMode === "custom" && customCm !== "" ? Number(customCm) : lengthCm;

  const price = useMemo(() => {
    const base = Number(product.basePrice) || 0;
    const fs = V1.enabled ? Number(flavor?.surcharge) || 0 : 0;
    let lengthSurcharge = 0;
    if (cl?.enabled && effectiveLengthCm) {
      lengthSurcharge = (effectiveLengthCm - rule.refCm) * rule.pricePerCm;
    }
    return Math.max(base, base + fs + lengthSurcharge);
  }, [product.basePrice, flavor, cl?.enabled, effectiveLengthCm, rule.refCm, rule.pricePerCm]);

  const lengthInvalid =
    !!cl?.enabled &&
    lengthMode === "custom" &&
    (customCm === "" || Number(customCm) < (cl.minCm || 30) || Number(customCm) > (cl.maxCm || 70));

  // Use flavor image if selected, else main product image
  const displayImage = flavor?.imageUrl || product.imageUrl;

  if (product.status === "unavailable") {
    return (
      <div className="mt-6 rounded-lg bg-[var(--accent)] p-4 text-sm text-[var(--primary-dark)]">
        Ce produit est actuellement indisponible.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {V1.enabled && product.flavors?.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
            {V1.labelSingular.charAt(0).toUpperCase() + V1.labelSingular.slice(1)} {flavor && <span className="text-[var(--primary)]">· {flavor.name}</span>}
          </label>
          <div className="flex flex-wrap gap-3">
            {product.flavors.map((f: any) => {
              const active = flavor?._id === f._id;
              return (
                <button
                  key={f._id}
                  type="button"
                  onClick={() => setFlavor(f)}
                  className={`group flex flex-col items-center gap-1 ${active ? "" : "opacity-70 hover:opacity-100"}`}
                >
                  <div
                    className={`h-16 w-16 overflow-hidden rounded-full border-2 transition-colors ${
                      active ? "border-[var(--primary)]" : "border-transparent group-hover:border-[var(--accent)]"
                    }`}
                  >
                    {f.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={f.imageUrl} alt={f.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--accent)] text-xs font-semibold text-[var(--primary)]">
                        {f.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs ${active ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]/70"}`}>
                    {f.name}
                    {f.surcharge > 0 && <span className="block text-[10px]">+{f.surcharge}€</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cl?.enabled && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
            Longueur de la chaîne{" "}
            <span className="text-[var(--primary)]">· {effectiveLengthCm} cm</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((cm) => (
              <button
                key={cm}
                type="button"
                onClick={() => {
                  setLengthMode("preset");
                  setLengthCm(cm);
                }}
                className={`rounded-full px-4 py-2 text-xs transition-colors ${
                  lengthMode === "preset" && lengthCm === cm
                    ? "bg-[var(--primary)] text-[var(--background)]"
                    : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
                }`}
              >
                {cm} cm
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLengthMode("custom")}
              className={`rounded-full px-4 py-2 text-xs transition-colors ${
                lengthMode === "custom"
                  ? "bg-[var(--primary)] text-[var(--background)]"
                  : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
              }`}
            >
              Sur mesure
            </button>
          </div>
          {lengthMode === "custom" && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={cl.minCm || 30}
                max={cl.maxCm || 70}
                value={customCm}
                onChange={(e) => setCustomCm(e.target.value)}
                placeholder={`${cl.minCm || 30}–${cl.maxCm || 70}`}
                className="w-24 rounded-lg border border-[var(--accent)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
              <span className="text-xs text-[var(--foreground)]/60">cm (entre {cl.minCm || 30} et {cl.maxCm || 70})</span>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Quantité</label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 rounded-full bg-[var(--muted)]">
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button type="button" onClick={() => setQty(qty + 1)} className="h-9 w-9 rounded-full bg-[var(--muted)]">
            +
          </button>
        </div>
      </div>

      {product.delay > 0 && (
        <p className="text-xs text-[var(--foreground)]/60">
          {siteConfig.product.delayLabel} : <strong>{product.delay}{siteConfig.product.delayUnit === "days" ? " jour(s)" : "h"}</strong> minimum
        </p>
      )}

      <div className="flex items-center justify-between border-t border-[var(--accent)] pt-4">
        <div className="text-2xl font-semibold text-[var(--primary)]">{(price * qty).toFixed(2)}€</div>
        <button
          type="button"
          disabled={lengthInvalid}
          onClick={() =>
            addToCart({
              productId: product._id,
              name: product.name,
              price,
              imageUrl: displayImage,
              flavor: flavor?.name,
              size: cl?.enabled ? `${effectiveLengthCm} cm` : undefined,
              quantity: qty,
            })
          }
          className="rounded-sm bg-[var(--primary)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
