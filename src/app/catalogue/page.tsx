import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import AddToCartButton from "@/components/AddToCartButton";
import { connectDb } from "@/lib/mongoose";
import { Product, Category, Settings } from "@/lib/models";
import { DEFAULT_METAL_TYPES } from "@/lib/metals";

export const dynamic = "force-dynamic";

// Filtre prix — volontairement léger : quelques paliers plutôt qu'un curseur, pour rester
// en liens simples côté serveur (pas de JS client supplémentaire).
const PRICE_BRACKETS: { key: string; label: string; min?: number; max?: number }[] = [
  { key: "-100", label: "Moins de 100€", max: 100 },
  { key: "100-200", label: "100€ – 200€", min: 100, max: 200 },
  { key: "200-400", label: "200€ – 400€", min: 200, max: 400 },
  { key: "400+", label: "400€ et plus", min: 400 },
];

function catalogueHref(params: { cat?: string; genre?: string; metal?: string; prix?: string }) {
  const qs = new URLSearchParams();
  if (params.cat) qs.set("cat", params.cat);
  if (params.genre) qs.set("genre", params.genre);
  if (params.metal) qs.set("metal", params.metal);
  if (params.prix) qs.set("prix", params.prix);
  const s = qs.toString();
  return s ? `/catalogue?${s}` : "/catalogue";
}

async function loadData() {
  await connectDb();
  const [products, categories, settings] = await Promise.all([
    Product.find().populate("category").sort({ createdAt: -1 }).lean(),
    Category.find({ active: true }).sort("name").lean(),
    Settings.findOne().lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    categories: JSON.parse(JSON.stringify(categories)),
    settings: JSON.parse(JSON.stringify(settings || {})),
  };
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; genre?: string; metal?: string; prix?: string }>;
}) {
  const sp = await searchParams;
  const { products, categories, settings } = await loadData();
  const metalTypes = settings.metalTypes?.length ? settings.metalTypes : DEFAULT_METAL_TYPES;
  const priceBracket = sp.prix ? PRICE_BRACKETS.find((b) => b.key === sp.prix) : undefined;

  const topLevelCats = categories.filter((c: any) => !c.parent);
  const selectedCat = sp.cat ? categories.find((c: any) => c._id === sp.cat) : undefined;
  // La rangée de sous-catégories s'affiche sous le parent sélectionné, ou sous le parent
  // de la sous-catégorie déjà sélectionnée (pour rester dans le même groupe).
  const activeParentId = selectedCat ? selectedCat.parent || selectedCat._id : undefined;
  const subCats = activeParentId ? categories.filter((c: any) => c.parent === activeParentId) : [];
  // Sélectionner une catégorie principale inclut ses sous-catégories, pour ne pas afficher
  // une grille vide quand les produits sont tous rangés dans les sous-catégories.
  const matchingCatIds = selectedCat
    ? selectedCat.parent
      ? [selectedCat._id]
      : [selectedCat._id, ...categories.filter((c: any) => c.parent === selectedCat._id).map((c: any) => c._id)]
    : null;

  const filtered = products
    .filter((p: any) => !matchingCatIds || matchingCatIds.includes(p.category?._id))
    .filter((p: any) => !sp.genre || (p.gender || "homme") === sp.genre)
    .filter((p: any) => !sp.metal || p.metal === sp.metal)
    .filter((p: any) => {
      if (!priceBracket) return true;
      if (priceBracket.min !== undefined && p.basePrice < priceBracket.min) return false;
      if (priceBracket.max !== undefined && p.basePrice >= priceBracket.max) return false;
      return true;
    });

  return (
    <>
      <Navbar brandName={settings.brandName} navLinks={settings.navLinks} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">NOTRE BOUTIQUE</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {[
              { key: undefined, label: "Tout" },
              { key: "homme", label: "Collections Homme" },
              { key: "femme", label: "Collections Femme" },
            ].map((g) => {
              const active = (sp.genre || undefined) === g.key;
              const isFemme = g.key === "femme";
              return (
                <Link
                  key={g.label}
                  href={catalogueHref({ cat: sp.cat, genre: g.key, metal: sp.metal, prix: sp.prix })}
                  className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                    active
                      ? isFemme
                        ? "bg-[var(--rose-gold)] text-white"
                        : "bg-[var(--primary)] text-[var(--background)]"
                      : isFemme
                      ? "border border-[var(--rose-gold)] text-[var(--rose-gold)] hover:bg-[var(--rose-gold)] hover:text-white"
                      : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
                  }`}
                >
                  {g.label}
                </Link>
              );
            })}
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-3">
            <Link
              href={catalogueHref({ genre: sp.genre, metal: sp.metal, prix: sp.prix })}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                !sp.cat
                  ? "bg-[var(--primary)] text-[var(--background)]"
                  : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
              }`}
            >
              Toutes les catégories
            </Link>
            {topLevelCats.map((c: any) => (
              <Link
                key={c._id}
                href={catalogueHref({ cat: c._id, genre: sp.genre, metal: sp.metal, prix: sp.prix })}
                className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                  sp.cat === c._id || c._id === activeParentId
                    ? "bg-[var(--primary)] text-[var(--background)]"
                    : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {subCats.length > 0 && (
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {subCats.map((c: any) => (
                <Link
                  key={c._id}
                  href={catalogueHref({ cat: c._id, genre: sp.genre, metal: sp.metal, prix: sp.prix })}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                    sp.cat === c._id
                      ? "bg-[var(--accent)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                      : "text-[var(--foreground)]/60 ring-1 ring-[var(--accent)] hover:text-[var(--primary)]"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <Link
              href={catalogueHref({ cat: sp.cat, genre: sp.genre, prix: sp.prix })}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                !sp.metal
                  ? "bg-[var(--accent)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                  : "text-[var(--foreground)]/60 ring-1 ring-[var(--accent)] hover:text-[var(--primary)]"
              }`}
            >
              Tous les métaux
            </Link>
            {metalTypes.map((m: any) => (
              <Link
                key={m.key}
                href={catalogueHref({ cat: sp.cat, genre: sp.genre, metal: m.key, prix: sp.prix })}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                  sp.metal === m.key
                    ? "bg-[var(--accent)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                    : "text-[var(--foreground)]/60 ring-1 ring-[var(--accent)] hover:text-[var(--primary)]"
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            <Link
              href={catalogueHref({ cat: sp.cat, genre: sp.genre, metal: sp.metal })}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                !sp.prix
                  ? "bg-[var(--accent)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                  : "text-[var(--foreground)]/60 ring-1 ring-[var(--accent)] hover:text-[var(--primary)]"
              }`}
            >
              Tous les prix
            </Link>
            {PRICE_BRACKETS.map((b) => (
              <Link
                key={b.key}
                href={catalogueHref({ cat: sp.cat, genre: sp.genre, metal: sp.metal, prix: b.key })}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                  sp.prix === b.key
                    ? "bg-[var(--accent)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                    : "text-[var(--foreground)]/60 ring-1 ring-[var(--accent)] hover:text-[var(--primary)]"
                }`}
              >
                {b.label}
              </Link>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-20 text-center text-[var(--foreground)]/60">Aucun produit dans cette catégorie</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p: any) => (
                <article key={p._id} className="group overflow-hidden rounded-lg bg-[var(--muted)] shadow-sm hover:shadow-lg">
                  {p.isNew && (
                    <span
                      className={`absolute z-10 m-3 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                        p.gender === "femme" ? "bg-[var(--rose-gold)] text-white" : "bg-[var(--primary)] text-[var(--background)]"
                      }`}
                    >
                      Nouveau
                    </span>
                  )}
                  <Link href={`/produit/${p._id}`}>
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-[var(--accent)] to-white">
                      {p.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-6xl">🍰</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    {p.category && (
                      <p className={`mb-1 text-[10px] uppercase tracking-wider ${p.gender === "femme" ? "text-[var(--rose-gold)]" : "text-[var(--primary)]"}`}>
                        {p.category.name}
                      </p>
                    )}
                    <Link href={`/produit/${p._id}`}>
                      <h3 className="line-clamp-1 font-medium hover:text-[var(--primary)]">{p.name}</h3>
                    </Link>
                    {p.shortDesc && <p className="mt-1 line-clamp-2 text-xs text-[var(--foreground)]/60">{p.shortDesc}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-serif text-lg text-[var(--primary)]">{p.basePrice.toFixed(2)}€</span>
                      <AddToCartButton product={p} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer brandName={settings.brandName} socialLinks={settings.socialLinks} />
    </>
  );
}
