import Link from "next/link";
import { Gem } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import ProductPrice from "@/components/ProductPrice";
import SectionHeader from "@/components/SectionHeader";
import { countStonesByNature, describeStone } from "@/lib/stones";

// Vitrine du stock de pierres : une carte de présentation, les natures réellement en stock
// (chacune renvoie vers le filtre correspondant du catalogue) puis les pièces serties, pièce
// par pièce. Tout est dérivé des produits réels — rien à saisir en plus côté admin.
export default function StoneShowcase({ products }: { products: any[] }) {
  if (products.length === 0) return null;
  const natures = countStonesByNature(products);

  return (
    <section className="border-t border-[var(--accent)]">
      <div className="px-[15px] pb-1.5 pt-[18px] sm:mx-auto sm:max-w-7xl sm:px-6 sm:py-10">
        <SectionHeader title="Nos pierres" />

        <ProductCarousel>
          {/* Carte de présentation, en tête de rangée */}
          <div className="flex w-64 flex-shrink-0 flex-col justify-between rounded-lg bg-[var(--gold-pale)] p-5 sm:w-72">
            <div>
              <Gem className="h-6 w-6 text-[var(--rose-gold)]" />
              <h3 className="mt-3 font-serif text-xl leading-snug">Pierres naturelles sélectionnées à la main</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)]/70">
                Chaque pierre est choisie une par une, puis sertie dans nos ateliers. Voici celles
                actuellement en stock — quand une pièce part, elle disparaît de cette rangée.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {natures.map((n) => (
                <Link
                  key={n.nature}
                  href={`/catalogue?pierre=${n.nature}`}
                  className="rounded-full border border-[var(--rose-gold)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--primary-dark)] transition-colors hover:bg-[var(--rose-gold)] hover:text-white"
                >
                  {n.label} · {n.count}
                </Link>
              ))}
            </div>
          </div>

          {products.map((p) => (
            <Link
              key={p._id}
              href={`/produit/${p._id}`}
              className="group w-40 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--muted)] shadow-sm transition-shadow hover:shadow-lg sm:w-48"
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-[var(--muted)] to-[var(--card)]">
                {p.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Gem className="h-10 w-10 text-[var(--rose-gold)]" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-[10px] uppercase tracking-wider text-[var(--rose-gold)]">
                  {describeStone(p.stone) || "Pierre"}
                </p>
                <h3 className="mt-1 line-clamp-2 text-xs font-medium group-hover:text-[var(--primary)]">{p.name}</h3>
                <ProductPrice product={p} className="mt-2 block text-sm font-semibold" />
              </div>
            </Link>
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
