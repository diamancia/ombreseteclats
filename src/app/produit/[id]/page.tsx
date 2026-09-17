import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductOrderForm from "@/components/ProductOrderForm";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import ProductBadges, { ProductSecondaryBadge } from "@/components/ProductBadges";
import ProductPrice from "@/components/ProductPrice";
import ContactButton from "@/components/ContactButton";
import { ArrowLeft } from "lucide-react";
import { getProductById, listProducts, getSettings } from "@/lib/db";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const product = await getProductById(id);
  if (!product) notFound();
  const settings = await getSettings();
  const brandName = (settings as any)?.brandName || siteConfig.brand.name;

  // Suggestions: same category first, then anything else (exclude current)
  const sameCatDocs = product.category
    ? await listProducts({ excludeId: product._id, categoryId: product.category._id, statusNot: "unavailable", limit: 4 })
    : [];
  let suggestions = sameCatDocs;
  if (suggestions.length < 4) {
    const fillers = (
      await listProducts({ excludeId: product._id, statusNot: "unavailable", limit: 4 - suggestions.length + sameCatDocs.length })
    ).filter((f) => !sameCatDocs.some((s) => s._id === f._id));
    suggestions = [...suggestions, ...fillers.slice(0, 4 - suggestions.length)];
  }
  const suggestionsJson: any[] = suggestions;

  // Gallery: main + extras, deduplicated
  const galleryImages = ([product.imageUrl, ...(product.images || [])].filter(Boolean) as string[])
    .filter((url, i, arr) => arr.indexOf(url) === i);

  return (
    <>
      <Navbar
        brandName={brandName}
        navLinks={(settings as any)?.navLinks}
        announcements={(settings as any)?.announcements}
        socialLinks={(settings as any)?.socialLinks}
        address={(settings as any)?.address}
        categoryBubbles={(settings as any)?.categoryBubbles}
      />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <Link href="/catalogue" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--primary)]">
            <ArrowLeft className="h-4 w-4" /> Retour à la boutique
          </Link>
          <div className="grid gap-10 md:grid-cols-2">
            <ProductGallery images={galleryImages} alt={product.name} badges={<ProductBadges product={product} />} />
            <div>
              {product.category && (
                <p className="mb-2 text-xs uppercase tracking-widest text-[var(--primary)]">{product.category.name}</p>
              )}
              <ProductSecondaryBadge product={product} className="mb-2" />
              <h1 className="font-serif text-4xl">{product.name}</h1>
              {product.shortDesc && <p className="mt-3 text-[var(--foreground)]/70">{product.shortDesc}</p>}
              <ProductPrice product={product} className="mt-6 block text-3xl font-semibold text-[var(--primary)]" />
              {product.longDesc && (
                <div className="mt-6 whitespace-pre-line text-sm text-[var(--foreground)]/80">{product.longDesc}</div>
              )}
              {siteConfig.product.hasAllergens && product.allergens && (
                <p className="mt-4 rounded-lg bg-[var(--muted)] p-3 text-xs text-[var(--foreground)]/70">
                  <strong>{siteConfig.product.allergensLabel} :</strong> {product.allergens}
                </p>
              )}
              <ProductOrderForm product={product} pricingRule={(settings as any)?.chainLengthPricing} />
            </div>
          </div>

          {suggestionsJson.length > 0 && (
            <section className="mt-20">
              <div className="mb-8 flex flex-col items-center">
                <h2 className="font-serif text-3xl tracking-wider">VOUS AIMEREZ AUSSI</h2>
                <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {suggestionsJson.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer
        brandName={brandName}
        navLinks={(settings as any)?.navLinks}
        socialLinks={(settings as any)?.socialLinks}
        email={(settings as any)?.email}
        phone={(settings as any)?.phone}
        address={(settings as any)?.address}
      />
      {siteConfig.features.whatsappButton && <ContactButton phone={(settings as any)?.phone} />}
    </>
  );
}
