import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { Mail, Phone, MapPin } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings: any = (await getSettings()) || {};
  const waHref = settings.phone ? `https://wa.me/${settings.phone.replace(/\D/g, "")}` : undefined;

  return (
    <>
      <Navbar brandName={settings.brandName} navLinks={settings.navLinks} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">CONTACT</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {settings.email && (
              <InfoCard icon={<Mail className="h-6 w-6" />} title="Email" value={settings.email} href={`mailto:${settings.email}`} />
            )}
            {settings.phone && (
              <InfoCard icon={<Phone className="h-6 w-6" />} title="Téléphone" value={settings.phone} href={`tel:${settings.phone.replace(/\s/g, "")}`} />
            )}
            {settings.zone && (
              <InfoCard icon={<MapPin className="h-6 w-6" />} title="Zone" value={settings.zone} />
            )}
          </div>

          {settings.address && process.env.GOOGLE_MAPS_API_KEY && (
            <div className="mt-12 overflow-hidden rounded-2xl shadow-sm">
              <iframe
                title="Localisation"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(settings.address)}`}
              />
            </div>
          )}

          <div className="mt-12 rounded-2xl bg-[var(--muted)] p-8 shadow-sm">
            <h2 className="mb-4 font-serif text-2xl">Une demande sur-mesure ?</h2>
            <p className="text-sm text-[var(--foreground)]/70">
              Mariage, anniversaire ou événement professionnel — écrivez-nous ou appelez-nous, nous répondons sous 24h ouvrées.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}?subject=Demande sur-mesure`}
                  className="rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)]"
                >
                  Envoyer un email
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="rounded-sm border border-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
                >
                  Appeler
                </a>
              )}
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-sm bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:brightness-95"
                >
                  <SocialIcon platform="whatsapp" className="h-4 w-4" />
                  Urgent ? WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer brandName={settings.brandName} socialLinks={settings.socialLinks} />
    </>
  );
}

function InfoCard({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href?: string }) {
  const content = (
    <>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--primary)]">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-sm">{value}</p>
    </>
  );
  return (
    <div className="rounded-2xl bg-[var(--muted)] p-6 text-center shadow-sm">
      {href ? <a href={href} className="block hover:text-[var(--primary)]">{content}</a> : content}
    </div>
  );
}
