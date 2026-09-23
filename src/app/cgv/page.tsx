import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ContactButton from "@/components/ContactButton";
import { getSettings } from "@/lib/db";
import { siteConfig } from "@/site.config";
import { getLegalPreset } from "@/lib/legalPresets";

export const dynamic = "force-dynamic";

export default async function CgvPage() {
  const settings: any = (await getSettings()) || {};
  const cgv = settings.cgv?.trim() || getLegalPreset().cgv;
  const brand = settings.brandName || siteConfig.brand.name;

  return (
    <>
      <Navbar
        brandName={brand}
        navLinks={settings.navLinks}
        announcements={settings.announcements}
        socialLinks={settings.socialLinks}
        address={settings.address}
        categoryBubbles={settings.categoryBubbles}
      />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-10">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">CONDITIONS GÉNÉRALES</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
            <p className="mt-4 text-sm text-[var(--foreground)]/60">Conditions générales de vente</p>
          </div>
          <div className="rounded-2xl bg-[var(--muted)] p-8 text-sm leading-relaxed text-[var(--foreground)]/80 shadow-sm whitespace-pre-line">
            {cgv}
          </div>
        </div>
      </main>
      <Footer
        brandName={brand}
        navLinks={settings.navLinks}
        socialLinks={settings.socialLinks}
        email={settings.email}
        phone={settings.phone}
        address={settings.address}
      />
      {siteConfig.features.whatsappButton && <ContactButton phone={settings.phone} />}
    </>
  );
}
