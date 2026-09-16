import Link from "next/link";
import { CreditCard, Award, Truck, Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/site.config";
import { SocialIcon, SOCIAL_BRAND_COLORS, normalizePlatformKey } from "@/components/SocialIcon";
import { buildMapsUrl } from "@/lib/maps";

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
  const quickLinks = navLinks.filter((l) => l.href !== "/" && l.href !== "/#contact" && l.href !== "/contact");

  return (
    <footer className="mt-10 border-t border-[var(--accent)] bg-[var(--muted)]">
      {/* Corps principal — colonnes Marque / Navigation / Légal / Contact, allégé (paddings
          réduits, plus de bloc badges séparé — condensé en une ligne ci-dessous). */}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  style={{ color: SOCIAL_BRAND_COLORS[normalizePlatformKey(s.platform)] }}
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-[var(--accent)] opacity-90 transition-opacity hover:opacity-100"
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
                  <span>
                    {address}{" "}
                    <a
                      href={buildMapsUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-[var(--primary)] hover:underline"
                    >
                      · Voir sur Google Maps
                    </a>
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Réassurance — condensée en une seule ligne (plus de bloc à part). */}
      <div className="border-t border-[var(--accent)] px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[11px] text-[var(--foreground)]/60">
          <span className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-[var(--primary)]" /> Argent massif 925, garanti 2 ans
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[var(--primary)]" /> Livraison offerte dès 80€
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-[var(--primary)]" /> Paiement sécurisé
          </span>
        </div>
      </div>

      <div className="border-t border-[var(--accent)] py-4 text-center text-xs text-[var(--foreground)]/50">
        <p>© {new Date().getFullYear()} {brandName} — {siteConfig.brand.tagline} — Tous droits réservés</p>
      </div>
    </footer>
  );
}
