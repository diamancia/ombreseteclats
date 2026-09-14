import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, ShieldCheck, CreditCard, Gem } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import CountdownTimer from "@/components/CountdownTimer";
import PromoGallery from "@/components/PromoGallery";
import { connectDb } from "@/lib/mongoose";
import { LandingPage, Settings } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function PromoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDb();
  const [lpDoc, settingsDoc] = await Promise.all([
    LandingPage.findOne({ slug }).lean(),
    Settings.findOne().lean(),
  ]);
  if (!lpDoc) notFound();

  const page: any = JSON.parse(JSON.stringify(lpDoc));
  const settings: any = JSON.parse(JSON.stringify(settingsDoc || {}));

  const now = Date.now();
  const started = page.active && (!page.startAt || new Date(page.startAt).getTime() <= now);
  if (!started) notFound();
  const ended = !!page.endAt && new Date(page.endAt).getTime() <= now;

  const discountPct = Math.round((1 - page.priceCurrent / page.priceOriginal) * 100);

  return (
    <>
      <Navbar
        brandName={settings.brandName}
        navLinks={settings.navLinks}
        announcements={settings.announcements}
        socialLinks={settings.socialLinks}
        address={settings.address}
      />
      <Cart />
      <main className="bg-black text-[#f5f1e8]">
        {/* Héro */}
        <section
          className="relative px-6 py-10 text-center"
          style={{ background: "radial-gradient(circle at 50% 20%, #1c1c1c 0%, #0a0a0a 70%)" }}
        >
          {page.kicker && (
            <p className="mb-3 font-serif text-[11px] uppercase tracking-[0.35em] text-[var(--rose-gold)]">{page.kicker}</p>
          )}

          <div className="relative mx-auto mb-6 max-w-sm">
            <PromoGallery images={page.images} alt={page.productName} />
            {discountPct > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-[var(--rose-gold)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1c1712]">
                -{discountPct}% aujourd&apos;hui
              </span>
            )}
          </div>

          <h1 className="mx-auto max-w-md font-serif text-3xl leading-tight sm:text-4xl">{page.productName}</h1>
          {page.tagline && (
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#f5f1e8]/65">{page.tagline}</p>
          )}

          <div className="mt-5 flex items-baseline justify-center gap-3">
            <span className="text-base text-[#f5f1e8]/45 line-through">{page.priceOriginal.toLocaleString("fr-FR")} DH</span>
            <span className="font-serif text-3xl text-[var(--rose-gold)]">{page.priceCurrent.toLocaleString("fr-FR")} DH</span>
          </div>
          {discountPct > 0 && (
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[#f5f1e8]/45">
              Soit {(page.priceOriginal - page.priceCurrent).toLocaleString("fr-FR")} DH d&apos;économie
            </p>
          )}

          <Link
            href={page.ctaLink || "/sur-mesure"}
            className="mt-6 inline-block w-full max-w-sm rounded-sm bg-[var(--rose-gold)] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#1c1712] hover:bg-[var(--primary-dark)]"
          >
            {page.ctaLabel || "Acheter maintenant"}
          </Link>
        </section>

        {/* Urgence / compte à rebours */}
        {!ended && page.endAt && (
          <section className="bg-[var(--rose-gold)] px-6 py-3.5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c1712]">
              Offre limitée — se termine dans <CountdownTimer endAt={page.endAt} />
            </p>
          </section>
        )}

        {/* Fiche technique */}
        {page.specs?.length > 0 && (
          <section className="border-t border-white/10 px-6 py-12">
            <p className="mb-1 text-center font-serif text-[11px] uppercase tracking-[0.25em] text-[var(--rose-gold)]">
              Caractéristiques
            </p>
            <h2 className="mb-6 text-center font-serif text-xl">Un choix pensé pour durer</h2>
            <div className="mx-auto mb-6 flex max-w-sm flex-wrap justify-center gap-2">
              {page.specs.map((s: any, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                >
                  {s.value}
                </span>
              ))}
            </div>
            <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-white/10">
              {page.specs.map((s: any, i: number) => (
                <div
                  key={i}
                  className={`flex justify-between px-4 py-3 text-xs ${i < page.specs.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <span className="text-[#f5f1e8]/55">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Réassurance */}
        <section className="border-y border-white/10 bg-[#141414] px-6 py-10">
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-6">
            <Reassurance icon={<Truck className="h-5 w-5" />} title="Livraison offerte" text="Dès 80€ en France & Europe" />
            <Reassurance icon={<ShieldCheck className="h-5 w-5" />} title="Garantie 2 ans" text="Contre tout défaut de fabrication" />
            <Reassurance icon={<CreditCard className="h-5 w-5" />} title="Paiement sécurisé" text="CB, Apple Pay, PayPal" />
            <Reassurance icon={<Gem className="h-5 w-5" />} title="Authenticité garantie" text="Pierre et métal certifiés" />
          </div>
        </section>

        {/* CTA répété */}
        <section className="px-6 py-12 text-center">
          <p className="mb-1 font-serif text-xl">Prête à porter l&apos;exception ?</p>
          <p className="mb-5 text-xs text-[#f5f1e8]/55">Édition limitée — quantités restreintes.</p>
          <Link
            href={page.ctaLink || "/sur-mesure"}
            className="inline-block w-full max-w-sm rounded-sm bg-[var(--rose-gold)] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#1c1712] hover:bg-[var(--primary-dark)]"
          >
            {page.ctaLabel || "Acheter maintenant"}
          </Link>
        </section>
      </main>

      <Footer
        brandName={settings.brandName}
        navLinks={settings.navLinks}
        socialLinks={settings.socialLinks}
        email={settings.email}
        phone={settings.phone}
        address={settings.address}
      />

      {/* Barre d'achat sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-white/10 bg-black/95 px-5 py-3 backdrop-blur">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#f5f1e8]/50">Prix promo</p>
          <p className="font-serif text-base text-[var(--rose-gold)]">{page.priceCurrent.toLocaleString("fr-FR")} DH</p>
        </div>
        <Link
          href={page.ctaLink || "/sur-mesure"}
          className="flex-1 max-w-[200px] rounded-sm bg-[var(--rose-gold)] px-6 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c1712] hover:bg-[var(--primary-dark)]"
        >
          Acheter
        </Link>
      </div>
      <div className="h-16" />
    </>
  );
}

function Reassurance({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[var(--primary)]">{icon}</span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide">{title}</p>
        <p className="mt-0.5 text-[11px] text-[#f5f1e8]/55">{text}</p>
      </div>
    </div>
  );
}
