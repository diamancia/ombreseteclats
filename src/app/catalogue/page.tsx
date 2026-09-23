import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import AddToCartButton from "@/components/AddToCartButton";
import ProductBadges, { ProductSecondaryBadge } from "@/components/ProductBadges";
import ProductPrice from "@/components/ProductPrice";
import ContactButton from "@/components/ContactButton";
import FilterPanel from "@/components/FilterPanel";
import MetalSlider from "@/components/MetalSlider";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import { listProducts, listBestSellerProducts, listCategories, getSettings } from "@/lib/db";
import { DEFAULT_METAL_TYPES } from "@/lib/metals";
import { STONE_NATURES, STONE_NATURE_LABELS, isStoneNature } from "@/lib/stones";
import { effectivePrice } from "@/lib/pricing";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

type CatalogueParams = {
  cat?: string;
  genre?: string;
  metal?: string;
  pierre?: string;
  min?: number;
  max?: number;
  bestseller?: boolean;
  promo?: boolean;
  isNew?: boolean;
};

function catalogueHref(params: CatalogueParams) {
  const qs = new URLSearchParams();
  if (params.cat) qs.set("cat", params.cat);
  if (params.genre) qs.set("genre", params.genre);
  if (params.metal) qs.set("metal", params.metal);
  if (params.pierre) qs.set("pierre", params.pierre);
  if (params.min !== undefined) qs.set("min", String(params.min));
  if (params.max !== undefined) qs.set("max", String(params.max));
  if (params.bestseller) qs.set("bestseller", "1");
  if (params.promo) qs.set("promo", "1");
  if (params.isNew) qs.set("new", "1");
  const s = qs.toString();
  return s ? `/catalogue?${s}` : "/catalogue";
}

async function loadData(bestsellerMode: boolean) {
  const [products, categories, settings] = await Promise.all([
    bestsellerMode ? listBestSellerProducts(24) : listProducts(),
    listCategories({ activeOnly: true }),
    getSettings(),
  ]);
  return { products, categories, settings: (settings || {}) as any };
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; genre?: string; metal?: string; pierre?: string; min?: string; max?: string; bestseller?: string; promo?: string; new?: string }>;
}) {
  const sp = await searchParams;
  const bestsellerMode = sp.bestseller === "1";
  const promoMode = sp.promo === "1";
  const newMode = sp.new === "1";
  const stoneFilter = isStoneNature(sp.pierre) ? sp.pierre : undefined;
  // Filtres transportés d'un clic à l'autre : sélectionner une catégorie ne doit pas faire
  // perdre la pierre ou le mode best-sellers déjà actifs.
  const carry = { bestseller: bestsellerMode, promo: promoMode, isNew: newMode, pierre: stoneFilter };
  const { products, categories, settings } = await loadData(bestsellerMode);
  const metalTypes = settings.metalTypes?.length ? settings.metalTypes : DEFAULT_METAL_TYPES;

  // Bornes du curseur de prix — dérivées des produits réels (arrondies pour un curseur lisible).
  const prices = products.map((p: any) => Number(p.basePrice) || 0);
  const priceFloor = prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 0;
  const priceCeil = prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 100;
  const priceMin = sp.min !== undefined ? Number(sp.min) : priceFloor;
  const priceMax = sp.max !== undefined ? Number(sp.max) : priceCeil;
  const priceActive = sp.min !== undefined || sp.max !== undefined;

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

  const chips: { label: string; removeHref: string }[] = [];
  if (sp.genre) {
    const genreLabels: Record<string, string> = {
      femme: "Collections Femme",
      enfant: "Collections Enfant",
      homme: "Collections Homme",
    };
    chips.push({
      label: genreLabels[sp.genre] || "Collections Homme",
      removeHref: catalogueHref({ ...carry, cat: sp.cat, metal: sp.metal }),
    });
  }
  if (selectedCat) {
    chips.push({
      label: (selectedCat as any).name,
      removeHref: catalogueHref({ ...carry, genre: sp.genre, metal: sp.metal }),
    });
  }
  if (sp.metal) {
    const m = metalTypes.find((mt: any) => mt.key === sp.metal);
    chips.push({
      label: m?.label || sp.metal,
      removeHref: catalogueHref({ ...carry, cat: sp.cat, genre: sp.genre }),
    });
  }
  if (stoneFilter) {
    chips.push({
      label: STONE_NATURE_LABELS[stoneFilter],
      removeHref: catalogueHref({ ...carry, pierre: undefined, cat: sp.cat, genre: sp.genre, metal: sp.metal }),
    });
  }
  if (priceActive) {
    chips.push({
      label: `${priceMin}€ – ${priceMax}€`,
      removeHref: catalogueHref({ ...carry, cat: sp.cat, genre: sp.genre, metal: sp.metal }),
    });
  }
  if (bestsellerMode) {
    chips.push({ label: "Best-sellers", removeHref: catalogueHref({ cat: sp.cat, genre: sp.genre, metal: sp.metal, pierre: stoneFilter, promo: promoMode, isNew: newMode }) });
  }
  if (promoMode) {
    chips.push({ label: "En réduction", removeHref: catalogueHref({ cat: sp.cat, genre: sp.genre, metal: sp.metal, pierre: stoneFilter, bestseller: bestsellerMode, isNew: newMode }) });
  }
  if (newMode) {
    chips.push({ label: "Nouveautés", removeHref: catalogueHref({ cat: sp.cat, genre: sp.genre, metal: sp.metal, pierre: stoneFilter, bestseller: bestsellerMode, promo: promoMode }) });
  }

  const filtered = products
    .filter((p: any) => !matchingCatIds || matchingCatIds.includes(p.category?._id))
    .filter((p: any) => !sp.genre || (p.gender || "homme") === sp.genre)
    .filter((p: any) => !sp.metal || p.metal === sp.metal)
    .filter((p: any) => !stoneFilter || p.stone?.nature === stoneFilter)
    .filter((p: any) => !promoMode || effectivePrice(p).discountPct != null)
    .filter((p: any) => !newMode || p.isNew)
    .filter((p: any) => {
      if (!priceActive) return true;
      const price = Number(p.basePrice) || 0;
      return price >= priceMin && price <= priceMax;
    });

  return (
    <>
      <Navbar
        brandName={settings.brandName}
        navLinks={settings.navLinks}
        announcements={settings.announcements}
        socialLinks={settings.socialLinks}
        address={settings.address}
        categoryBubbles={settings.categoryBubbles}
      />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">NOTRE BOUTIQUE</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
          </div>

          <FilterPanel activeChips={chips} clearHref="/catalogue">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/60">Genre</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: undefined, label: "Tout" },
                  { key: "homme", label: "Collections Homme" },
                  { key: "femme", label: "Collections Femme" },
                  { key: "enfant", label: "Collections Enfant" },
                ].map((g) => {
                  const active = (sp.genre || undefined) === g.key;
                  const isFemme = g.key === "femme";
                  return (
                    <Link
                      key={g.label}
                      href={catalogueHref({ ...carry, cat: sp.cat, genre: g.key, metal: sp.metal, min: sp.min ? Number(sp.min) : undefined, max: sp.max ? Number(sp.max) : undefined })}
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
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/60">Catégorie</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={catalogueHref({ ...carry, genre: sp.genre, metal: sp.metal, min: sp.min ? Number(sp.min) : undefined, max: sp.max ? Number(sp.max) : undefined })}
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
                    href={catalogueHref({ ...carry, cat: c._id, genre: sp.genre, metal: sp.metal, min: sp.min ? Number(sp.min) : undefined, max: sp.max ? Number(sp.max) : undefined })}
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {subCats.map((c: any) => (
                    <Link
                      key={c._id}
                      href={catalogueHref({ ...carry, cat: c._id, genre: sp.genre, metal: sp.metal, min: sp.min ? Number(sp.min) : undefined, max: sp.max ? Number(sp.max) : undefined })}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                        sp.cat === c._id
                          ? "bg-white text-[var(--primary)] ring-1 ring-[var(--primary)]"
                          : "text-[var(--foreground)]/70 ring-1 ring-[var(--primary)]/30 hover:text-[var(--primary)]"
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/60">Pierre</p>
              <div className="flex flex-wrap gap-2">
                {[undefined, ...STONE_NATURES].map((nature) => {
                  const active = stoneFilter === nature;
                  const count = nature ? products.filter((p: any) => p.stone?.nature === nature).length : 0;
                  return (
                    <Link
                      key={nature ?? "toutes"}
                      href={catalogueHref({ ...carry, pierre: nature, cat: sp.cat, genre: sp.genre, metal: sp.metal, min: sp.min ? Number(sp.min) : undefined, max: sp.max ? Number(sp.max) : undefined })}
                      className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                        active
                          ? "bg-[var(--rose-gold)] text-white"
                          : "border border-[var(--rose-gold)] text-[var(--rose-gold)] hover:bg-[var(--rose-gold)] hover:text-white"
                      }`}
                    >
                      {nature ? `${STONE_NATURE_LABELS[nature]} (${count})` : "Toutes les pierres"}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/60">Métal</p>
                <MetalSlider
                  metalTypes={metalTypes}
                  value={sp.metal}
                  hrefFor={(metalKey) => catalogueHref({ ...carry, cat: sp.cat, genre: sp.genre, metal: metalKey, min: sp.min ? Number(sp.min) : undefined, max: sp.max ? Number(sp.max) : undefined })}
                />
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/60">Budget</p>
                <PriceRangeSlider
                  min={priceFloor}
                  max={priceCeil}
                  lo={priceMin}
                  hi={priceMax}
                  hrefFor={(lo, hi) => catalogueHref({ ...carry, cat: sp.cat, genre: sp.genre, metal: sp.metal, min: lo, max: hi })}
                />
              </div>
            </div>
          </FilterPanel>

          {filtered.length === 0 ? (
            <p className="py-14 text-center text-[var(--foreground)]/60">Aucun produit dans cette catégorie</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p: any) => (
                <article key={p._id} className="group relative overflow-hidden rounded-lg bg-[var(--muted)] shadow-sm hover:shadow-lg">
                  <ProductBadges product={p} />
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
                    <ProductSecondaryBadge product={p} className="mb-1.5" />
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
                      <ProductPrice product={p} className="font-serif text-lg text-[var(--primary)]" />
                      <AddToCartButton product={p} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer brandName={settings.brandName} navLinks={settings.navLinks} socialLinks={settings.socialLinks} email={settings.email} phone={settings.phone} address={settings.address} />
      {siteConfig.features.whatsappButton && <ContactButton phone={settings.phone} />}
    </>
  );
}
