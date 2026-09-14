import Link from "next/link";
import { CreditCard, Award, Truck, Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/site.config";
import { SocialIcon } from "@/components/SocialIcon";

export type FooterSocialLink = { platform: string; url: string; active?: boolean };
export type FooterNavLink = { href: string; label: string };

export default function Footer({
  brandName = siteConfig.brand.name,
  tagline = siteConfig.brand.tagline,
  navLinks = siteConfig.navbar.links,
  socialLinks = [],
  email,
  phone,
  address,
}: {
  brandName?: string;
  tagline?: string;
  navLinks?: FooterNavLink[];
  socialLinks?: FooterSocialLink[];
  email?: string;
  phone?: string;
  address?: string;
}) {
  const activeSocials = socialLinks.filter((s) => s.active !== false && s.url);
  const quickLinks = navLinks.filter((l) => l.href !== "/" && l.href !== "/#contact");

  return (
    <footer className="mt-10 border-t border-[var(--accent)] bg-[var(--muted)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">Argent massif 925</p>
            <p className="text-xs text-[var(--foreground)]/60">Poinçonné, garanti 2 ans</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">Livraison offerte</p>
            <p className="text-xs text-[var(--foreground)]/60">Dès 80€ en France & Europe</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider">Paiement sécurisé</p>
            <p className="text-xs text-[var(--foreground)]/60">CB, Apple Pay, PayPal</p>
          </div>
        </div>
      </div>

      {/* Corps principal — colonnes Marque / Navigation / Légal / Contact, standard d'un
          pied de page "pro" plutôt qu'un simple empilement de blocs. */}
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-[var(--accent)] px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={siteConfig.brand.logoUrl} alt={brandName} className="h-10 w-auto object-contain" />
          <p className="mt-3 text-xs text-[var(--foreground)]/60">{tagline}</p>
          {activeSocials.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {activeSocials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)]/60 ring-1 ring-[var(--accent)] transition-colors hover:text-[var(--primary)] hover:ring-[var(--primary)]"
                >
                  <SocialIcon platform={s.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--foreground)]/40">Navigation</h3>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--foreground)]/40">Informations légales</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#a-propos" className="text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                Conditions générales de vente
              </Link>
            </li>
            <li>
              <Link href="/rgpd" className="text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                Confidentialité (RGPD)
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                Cookies
              </Link>
            </li>
          </ul>
        </div>

        {(email || phone || address) && (
          <div id="contact" className="scroll-mt-24">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--foreground)]/40">Contact</h3>
            <ul className="space-y-3 text-sm">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-2 text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                    <Mail className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                    <span>{email}</span>
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-[var(--foreground)]/70 hover:text-[var(--primary)]">
                    <Phone className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                    <span>{phone}</span>
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2 text-[var(--foreground)]/70">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {address && process.env.GOOGLE_MAPS_API_KEY && (
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl px-6 pb-10">
          <iframe
            title="Localisation"
            width="100%"
            height="220"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`}
          />
        </div>
      )}

      <div className="border-t border-[var(--accent)] py-5 text-center text-xs text-[var(--foreground)]/50">
        <p>© {new Date().getFullYear()} {brandName} — {siteConfig.brand.tagline} — Tous droits réservés</p>
      </div>
    </footer>
  );
}
