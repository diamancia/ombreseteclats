import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import OrderForm from "@/components/OrderForm";
import ContactButton from "@/components/ContactButton";
import { getSettings } from "@/lib/db";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function CommanderPage() {
  const settings: any = (await getSettings()) || {};

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
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">COMMANDER</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
            <p className="mt-4 text-center text-sm text-[var(--foreground)]/60">
              Retrait uniquement à notre atelier · Délai minimum {settings.minDelay || 2}h
            </p>
          </div>
          <OrderForm settings={settings} />
        </div>
      </main>
      <Footer brandName={settings.brandName} navLinks={settings.navLinks} socialLinks={settings.socialLinks} email={settings.email} phone={settings.phone} address={settings.address} />
      {siteConfig.features.whatsappButton && <ContactButton phone={settings.phone} />}
    </>
  );
}
