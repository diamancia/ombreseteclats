"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminClient";
import { effectivePrice } from "@/lib/pricing";

export default function AdminPromotionsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [discountPct, setDiscountPct] = useState(20);
  const [hours, setHours] = useState(48);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function apply(isBlackFriday: boolean) {
    if (selected.size === 0) return;
    setApplying(true);
    setError(null);
    try {
      await adminFetch("/api/products/apply-promo", {
        method: "POST",
        body: JSON.stringify({ ids: Array.from(selected), isBlackFriday, discountPct, hours }),
      });
      setSelected(new Set());
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl">Promotions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Applique une réduction Black Friday (compte à rebours + %) à tous les produits que tu
          sélectionnes ci-dessous, en une fois — indépendant de la case "Réduction" de la fiche
          produit individuelle.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Réduction (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={discountPct}
            onChange={(e) => setDiscountPct(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Durée du compte à rebours (heures)</label>
          <input
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          />
        </div>
        <div className="ml-auto flex gap-3">
          <button
            onClick={() => apply(false)}
            disabled={selected.size === 0 || applying}
            className="rounded-sm border border-gray-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-gray-600 disabled:opacity-40"
          >
            Retirer ({selected.size})
          </button>
          <button
            onClick={() => apply(true)}
            disabled={selected.size === 0 || applying}
            className="rounded-sm bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#e8c46b] disabled:opacity-40"
          >
            {applying ? "Application…" : `Appliquer Black Friday (${selected.size})`}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => {
            const { price, originalPrice } = effectivePrice(p);
            const active = selected.has(p._id);
            const bfActive = p.isBlackFriday && (!p.promoEndsAt || new Date(p.promoEndsAt) > new Date());
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => toggle(p._id)}
                className={`relative overflow-hidden rounded-xl border-2 bg-white p-2 text-left transition-colors ${
                  active ? "border-[var(--primary)]" : "border-transparent hover:border-gray-200"
                }`}
              >
                {bfActive && (
                  <span className="absolute left-2 top-2 z-10 rounded bg-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#e8c46b]">
                    BF
                  </span>
                )}
                <input type="checkbox" checked={active} readOnly className="absolute right-2 top-2 z-10 h-4 w-4" />
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-50">
                  {p.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">🍰</div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {originalPrice != null && <span className="mr-1 line-through">{originalPrice.toFixed(2)}€</span>}
                  {price.toFixed(2)}€
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
