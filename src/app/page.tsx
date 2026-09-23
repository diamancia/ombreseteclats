import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import ContactButton from "@/components/ContactButton";
import GoogleReviews from "@/components/GoogleReviews";
import HeroSlider from "@/components/HeroSlider";
import ProductCarousel from "@/components/ProductCarousel";
import SectionHeader from "@/components/SectionHeader";
import ShopRibbon from "@/components/ShopRibbon";
import StoneShowcase from "@/components/StoneShowcase";
import EditModeProvider from "@/components/admin/EditMode";
import InlineEditableText from "@/components/admin/InlineEditableText";
import { listProducts, listBestSellerProducts, getSettings } from "@/lib/db";
import { hasStone } from "@/lib/stones";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

async function loadData() {
  const [products, bestSellers, settingsDoc] = await Promise.all([
    listProducts(),
    listBestSellerProducts(12),
    getSettings(),
  ]);
  const settings: any = settingsDoc || {};
  return { products, bestSellers, settings };
}

export default async function HomePage() {
  const { products, bestSellers, settings } = await loadData();
  const inStock = products.filter((p: any) => p.status !== "unavailable");
  // Rangée "Nouveautés" : toute la collection récente, pas une sélection de 5 — le carrousel
  // absorbe le volume, plus besoin de tronquer.
  const newItems = inStock.filter((p: any) => p.isNew);
  const displayedNew = newItems.length > 0 ? newItems : inStock;
  const stonePieces = inStock.filter(hasStone);
  const brandName = settings.brandName || siteConfig.brand.name;
  const heroImage = settings.heroImageUrl || siteConfig.hero.defaultImageUrl;
  const heroSlides = settings.heroSlides?.length ? settings.heroSlides : [{ imageUrl: heroImage }];
  // Toggle admin (Paramètres > Hero) : masque entièrement le visuel, le bloc texte prend
  // toute la largeur et la section suivante s'enchaîne directement, sans espace réservé.
  const showHeroVisual = settings.heroSlidesEnabled !== false;
  const hasHeroImage = heroSlides.some((s: any) => s.imageUrl?.trim());
  // Sans photo exploitable, HeroSlider renvoie null : on ne rend alors PAS la carte plein écran,
  // sinon le titre flotterait au milieu d'un bloc de 440 px vide.
  const useHeroCard = showHeroVisual && hasHeroImage;
  const heroTitle = settings.heroTitle || siteConfig.hero.defaultTitle;
  const heroSubtitle = settings.heroSubtitle || siteConfig.hero.defaultSubtitle;

  // Dernière pièce ajoutée — alimente le message "Cliquez et consultez nos dernières
  // créations" du bandeau défilant, toujours à jour sans intervention manuelle.
  const latestProduct = products[0];
  const announcements = latestProduct
    ? [
        { text: "Cliquez et consultez nos dernières créations", link: `/produit/${latestProduct._id}`, active: true },
        ...(settings.announcements || []),
      ]
    : settings.announcements;

  return (
    <EditModeProvider>
      <Navbar
        brandName={brandName}
        navLinks={settings.navLinks}
        announcements={announcements}
        socialLinks={settings.socialLinks}
        address={settings.address}
        categoryBubbles={settings.categoryBubbles}
      />
      <Cart />
      <main className="min-h-screen">
        {/* Hero — en mobile, une photo pleine largeur de 440 px avec le titre et un CTA unique
            posés dessus ; en desktop, la grille deux colonnes classique (texte | carrousel).
            Une SEULE arborescence sert les deux : le conteneur mobile passe en `lg:contents`,
            ses deux enfants redeviennent alors les colonnes de la grille. Dupliquer le bloc
            monterait deux InlineEditableText sur le même champ (édition admin cassée) et deux
            HeroSlider (deux setInterval concurrents). */}
        <section className="relative overflow-hidden bg-[var(--background)]">
          <div
            className={`lg:mx-auto lg:grid lg:max-w-7xl lg:items-center lg:gap-16 lg:px-6 lg:py-16 ${
              showHeroVisual ? "lg:grid-cols-2" : "lg:grid-cols-1"
            }`}
          >
            <div
              className={
                useHeroCard
                  ? "relative h-[440px] w-full overflow-hidden lg:contents"
                  : "lg:contents"
              }
            >
              {/* Photo(s) de fond */}
              {useHeroCard && (
                <div className="absolute inset-0 lg:relative lg:order-2 lg:inset-auto">
                  <HeroSlider
                    slides={heroSlides}
                    intervalMs={settings.heroSlidesIntervalMs}
                    className="absolute inset-0 h-full w-full overflow-hidden lg:relative lg:mx-auto lg:aspect-square lg:h-auto lg:w-full lg:max-w-sm lg:rounded-sm lg:ring-1 lg:ring-[var(--primary)]/20"
                  />
                  {/* Voile de lisibilité — les photos sont téléversées depuis l'admin, donc
                      imprévisibles : un aplat léger + un dégradé bas garantissent le texte blanc
                      aussi bien sur une photo claire que sombre. Mobile uniquement. */}
                  <div className="pointer-events-none absolute inset-0 bg-[var(--foreground)]/35 lg:hidden" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/75 via-transparent to-transparent lg:hidden" />
                </div>
              )}

              {/* Titre + CTA — centrés dans la partie basse de la photo en mobile, colonne de
                  gauche alignée à gauche en desktop. */}
              <div
                className={
                  useHeroCard
                    ? "absolute inset-x-0 bottom-9 z-[2] px-6 text-center lg:static lg:order-1 lg:flex lg:flex-col lg:px-0 lg:text-left"
                    : "px-6 py-12 lg:flex lg:flex-col lg:px-0 lg:py-0"
                }
              >
                <p className="mb-5 hidden text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--primary)] lg:block">
                  Pièces sur-mesure
                </p>
                <InlineEditableText
                  as="h1"
                  field="heroTitle"
                  value={heroTitle}
                  className={`font-serif text-[32px] leading-[1.1] [text-wrap:balance] sm:text-[38px] lg:text-6xl lg:leading-[1.05] ${
                    useHeroCard
                      ? "text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] lg:text-[var(--foreground)] lg:[text-shadow:none]"
                      : ""
                  }`}
                />
                <InlineEditableText
                  as="p"
                  field="heroSubtitle"
                  value={heroSubtitle}
                  multiline
                  className="mt-6 hidden max-w-xl text-justify text-base leading-relaxed text-[var(--foreground)]/70 lg:block"
                />
                <div className="mt-5 lg:mt-8 lg:flex lg:flex-wrap lg:gap-3">
                  <Link
                    href="/catalogue"
                    className="inline-block rounded-sm bg-[var(--primary)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--foreground)] hover:bg-[var(--primary-dark)] hover:text-[var(--background)] lg:px-8 lg:py-4 lg:text-xs lg:tracking-[0.2em]"
                  >
                    Découvrir les collections
                  </Link>
                  {siteConfig.features.customOrders && (
                    <Link
                      href="/sur-mesure"
                      className="hidden rounded-sm border border-[var(--primary)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] lg:inline-block"
                    >
                      Pièce sur-mesure
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bannière publicitaire — cahier des charges 4.10, activable sans redéploiement */}
        {settings.bannerEnabled && settings.bannerUrl && (
          <section className="overflow-hidden">
            <BannerContent
              type={settings.bannerType}
              size={settings.bannerSize}
              url={settings.bannerUrl}
              link={settings.bannerLink}
            />
          </section>
        )}

        {/* Meilleures ventes — ce que les clients achètent réellement (commandes payées),
            avec repli sur les pièces récentes tant qu'il n'y a pas d'historique de vente. */}
        {bestSellers.length > 0 && (
          <section className="px-[15px] pb-1.5 pt-[18px] sm:mx-auto sm:max-w-7xl sm:px-6 sm:py-10">
            <SectionHeader title="Meilleures ventes" href="/catalogue?bestseller=1" linkLabel="Voir tout" />
            <ProductCarousel>
              {bestSellers.map((p: any) => (
                <div key={p._id} className="w-40 flex-shrink-0 sm:w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </ProductCarousel>
          </section>
        )}

        {/* Filet fin plutôt qu'un grand vide : même rythme vertical entre toutes les rangées. */}
        {bestSellers.length > 0 && displayedNew.length > 0 && (
          <div className="mx-[15px] mt-[22px] h-px bg-[var(--accent)] sm:mx-auto sm:mt-0 sm:max-w-7xl" />
        )}

        {/* Nouveautés — toute la collection récente dans une rangée défilante */}
        {displayedNew.length > 0 && (
          <section className="px-[15px] pb-1.5 pt-[18px] sm:mx-auto sm:max-w-7xl sm:px-6 sm:py-10">
            <SectionHeader title="Nouveautés" href="/catalogue?new=1" linkLabel="Voir tout" />
            <ProductCarousel>
              {displayedNew.map((p: any) => (
                <div key={p._id} className="w-40 flex-shrink-0 sm:w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </ProductCarousel>
          </section>
        )}

        {/* Stock de pierres, visualisable et filtrable depuis le catalogue */}
        <StoneShowcase products={stonePieces} />
      </main>

      <GoogleReviews />

      <Footer brandName={brandName} navLinks={settings.navLinks} socialLinks={settings.socialLinks} email={settings.email} phone={settings.phone} address={settings.address} />

      {siteConfig.features.whatsappButton && <ContactButton phone={settings.phone} />}
      <ShopRibbon />
    </EditModeProvider>
  );
}

const BANNER_HEIGHTS: Record<string, string> = {
  compacte: "h-48 md:h-56",
  standard: "h-72 md:h-96",
  pleine: "h-[70vh] md:h-[85vh]",
};

function BannerContent({
  type,
  size,
  url,
  link,
}: {
  type: string;
  size: string;
  url: string;
  link?: string;
}) {
  const heightClass = BANNER_HEIGHTS[size] || BANNER_HEIGHTS.standard;
  const media =
    type === "video" ? (
      <video src={url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-full w-full object-cover" />
    );

  const content = <div className={`relative w-full ${heightClass}`}>{media}</div>;

  return link ? <Link href={link}>{content}</Link> : content;
}
