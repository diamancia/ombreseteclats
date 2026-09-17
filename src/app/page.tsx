import Link from "next/link";
import { Award, Gem, Hammer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import ContactButton from "@/components/ContactButton";
import GoogleReviews from "@/components/GoogleReviews";
import EditModeProvider from "@/components/admin/EditMode";
import InlineEditableText from "@/components/admin/InlineEditableText";
import { listProducts, getSettings } from "@/lib/db";
import { siteConfig } from "@/site.config";
import { getLegalPreset } from "@/lib/legalPresets";

export const dynamic = "force-dynamic";

async function loadData() {
  const [products, settingsDoc] = await Promise.all([listProducts(), getSettings()]);
  const settings: any = settingsDoc || {};
  return { products, settings };
}

export default async function HomePage() {
  const { products, settings } = await loadData();
  const newItems = products.filter((p: any) => p.isNew && p.status !== "unavailable").slice(0, 5);
  const displayedNew = newItems.length > 0 ? newItems : products.slice(0, 5);
  const brandName = settings.brandName || siteConfig.brand.name;
  const heroImage = settings.heroImageUrl || siteConfig.hero.defaultImageUrl;
  const heroTitle = settings.heroTitle || siteConfig.hero.defaultTitle;
  const heroSubtitle = settings.heroSubtitle || siteConfig.hero.defaultSubtitle;
  const about = settings.about?.trim() || getLegalPreset().about;

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
        {/* Hero — fond noir fixe dans les deux thèmes (identité de marque), texte donc en
            couleur fixe plutôt que --foreground qui, lui, bascule avec le mode clair/sombre. */}
        <section className="relative overflow-hidden bg-black text-[#f5f1e8]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
            {/* Texte */}
            <div className="flex flex-col">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--primary)]">
                Pièces sur-mesure
              </p>
              <InlineEditableText
                as="h1"
                field="heroTitle"
                value={heroTitle}
                className="font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
              />
              <InlineEditableText
                as="p"
                field="heroSubtitle"
                value={heroSubtitle}
                multiline
                className="mt-8 max-w-xl text-justify text-base leading-relaxed text-[#f5f1e8]/70"
              />
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/catalogue"
                  className="rounded-sm bg-[var(--primary)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-[var(--primary-dark)]"
                >
                  Découvrir les collections
                </Link>
                {siteConfig.features.customOrders && (
                  <Link
                    href="/sur-mesure"
                    className="rounded-sm border border-[var(--primary)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black"
                  >
                    Pièce sur-mesure
                  </Link>
                )}
              </div>
            </div>

            {/* Atelier de gravure */}
            <div className="relative">
              <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-sm ring-1 ring-[var(--primary)]/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="Atelier de gravure" className="h-full w-full object-cover" />
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

        {/* Nouveautés */}
        {displayedNew.length > 0 && (
          <section className="bg-[var(--muted)] py-20">
            <div className="mx-auto max-w-7xl px-6">
              <SectionHeader title="NOUVEAUTÉS" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                {displayedNew.map((p: any) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* À propos — fusionnée depuis l'ancienne page /a-propos (supprimée : éviter le
            contenu dupliqué sur deux pages, cf. recommandations SEO). Section secondaire
            (H2), volontairement compacte pour ne pas concurrencer les produits. */}
        <section id="a-propos" className="scroll-mt-24 border-t border-[var(--accent)] py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-10 flex flex-col items-center text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
                Notre histoire
              </p>
              <h2 className="font-serif text-3xl tracking-wider">À PROPOS DE {brandName.toUpperCase()}</h2>
              <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
            </div>
            <InlineEditableText
              as="div"
              field="about"
              value={about}
              multiline
              className="mx-auto max-w-2xl whitespace-pre-line text-center text-sm leading-relaxed text-[var(--foreground)]/75"
            />
            <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
              <Value icon={<Hammer className="h-5 w-5" />} title="Façonné main" text="Chaque pièce travaillée dans notre atelier." />
              <Value icon={<Gem className="h-5 w-5" />} title="Argent 925 poinçonné" text="Matière noble garantie à vie." />
              <Value icon={<Award className="h-5 w-5" />} title="Pièces intemporelles" text="Lignes épurées pensées pour durer." />
            </div>
          </div>
        </section>
      </main>

      <GoogleReviews />

      <Footer brandName={brandName} navLinks={settings.navLinks} socialLinks={settings.socialLinks} email={settings.email} phone={settings.phone} address={settings.address} />

      {siteConfig.features.whatsappButton && <ContactButton phone={settings.phone} />}
    </EditModeProvider>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-12 flex flex-col items-center">
      <h2 className="font-serif text-3xl tracking-wider">{title}</h2>
      <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
    </div>
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

function Value({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[var(--muted)] p-5 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--primary)]">{icon}</div>
      <h3 className="font-serif text-base">{title}</h3>
      <p className="mt-1.5 text-xs text-[var(--foreground)]/70">{text}</p>
    </div>
  );
}
