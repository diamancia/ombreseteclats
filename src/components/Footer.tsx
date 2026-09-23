import Link from "next/link";
import { Sparkle, Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/site.config";
import { SocialIcon, SOCIAL_BRAND_COLORS, normalizePlatformKey } from "@/components/SocialIcon";
import { buildMapsUrl } from "@/lib/maps";
import { filterActiveNavLinks, splitCollectionsLinks, shortGenreLabel } from "@/lib/navLinks";
import FooterAccordionItem from "@/components/FooterAccordionItem";

export type FooterSocialLink = { platform: string; url: string; active?: boolean };
export type FooterNavLink = { href: string; label: string };

// Initiales de marque pour le monogramme — dérivées du vrai nom (jamais codées en dur), pour
// rester correct quel que soit le site/client qui tourne sur cette base (cf. site.config.ts).
// Les mots sans lettre (le "&" de "Ombre & Éclats") sont ignorés.
function brandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function Footer({
  brandName = siteConfig.brand.name,
  navLinks = siteConfig.navbar.links,
  socialLinks = [],
  email,
  phone,
  address,
}: {
  brandName?: string;
  navLinks?: FooterNavLink[];
  socialLinks?: FooterSocialLink[];
  email?: string;
  phone?: string;
  address?: string;
}) {
  const activeSocials = socialLinks.filter((s) => s.active !== false && s.url);
  const quickLinks = filterActiveNavLinks(
    navLinks.filter((l) => l.href !== "/" && l.href !== "/#contact" && l.href !== "/contact")
  );
  const { genreLinks, otherLinks } = splitCollectionsLinks(quickLinks);
  const boutiqueLink = otherLinks.find((l) => l.href === "/catalogue");
  const surMesureLink = otherLinks.find((l) => l.href === "/sur-mesure");
  const linkClass = "block py-1.5 text-[13px] text-[var(--foreground)]/75 hover:text-[var(--primary)]";

  return (
    <footer className="mt-10 border-t border-[var(--accent)] bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-6 sm:py-10">
        {/* Ligne du haut — monogramme + nom de marque à gauche, réseaux sociaux à droite. Plus
            de sous-titre ici (argent 925 / bijouterie d'homme) : c'est déjà dit ailleurs sur le
            site, et ça alourdissait un footer censé rester compact. */}
        <div className="flex items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--primary)] font-serif text-xs font-medium text-[var(--primary-dark)]">
              {brandInitials(brandName)}
            </span>
            <span className="font-serif text-base text-[var(--foreground)]">{brandName}</span>
          </div>
          {activeSocials.length > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {activeSocials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  style={{ color: SOCIAL_BRAND_COLORS[normalizePlatformKey(s.platform)] }}
                  className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-[var(--accent)] opacity-90 transition-opacity hover:opacity-100"
                >
                  <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Trois rubriques en accordéon — Navigation ouverte par défaut, les deux autres
            repliées. Chaque en-tête est un vrai <button>, animé en CSS pur (voir
            FooterAccordionItem), sans mesure de hauteur en JS. */}
        <div>
          <FooterAccordionItem title="Navigation" defaultOpen>
            {boutiqueLink && (
              <Link href={boutiqueLink.href} className={linkClass}>
                {boutiqueLink.label}
              </Link>
            )}
            {genreLinks.length > 0 && (
              <FooterAccordionItem title="Collections" level={1}>
                {genreLinks.map((l) => (
                  <Link key={l.href} href={l.href} className={linkClass}>
                    {shortGenreLabel(l.label)}
                  </Link>
                ))}
              </FooterAccordionItem>
            )}
            {surMesureLink && (
              <Link href={surMesureLink.href} className={linkClass}>
                {surMesureLink.label}
              </Link>
            )}
          </FooterAccordionItem>

          <FooterAccordionItem title="Informations légales">
            <Link href="/cgv" className={linkClass}>
              Conditions générales de vente
            </Link>
            <Link href="/rgpd" className={linkClass}>
              Confidentialité (RGPD)
            </Link>
            <Link href="/cookies" className={linkClass}>
              Cookies
            </Link>
          </FooterAccordionItem>

          {(email || phone || address) && (
            <FooterAccordionItem title="Contact">
              <div id="contact" className="scroll-mt-24 space-y-2.5 pt-0.5">
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-2 text-[13px] text-[var(--foreground)]/75 hover:text-[var(--primary)]">
                    <Mail className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                    <span>{email}</span>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-[13px] text-[var(--foreground)]/75 hover:text-[var(--primary)]">
                    <Phone className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                    <span>{phone}</span>
                  </a>
                )}
                {address && (
                  <div className="flex items-start gap-2 text-[13px] text-[var(--foreground)]/75">
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
                  </div>
                )}
              </div>
            </FooterAccordionItem>
          )}
        </div>
      </div>

      {/* Badge de confiance — une seule ligne, plus de mentions livraison/paiement. */}
      <div className="border-t border-[var(--accent)] px-6 py-3">
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--foreground)]/60">
          <Sparkle className="h-3.5 w-3.5 text-[var(--primary)]" /> Bijoux en or et argent
        </p>
      </div>

      <div className="border-t border-[var(--accent)] py-4 text-center text-[11px] text-[var(--ink-faint)]">
        <p>© {new Date().getFullYear()} {brandName} — Tous droits réservés</p>
      </div>
    </footer>
  );
}
