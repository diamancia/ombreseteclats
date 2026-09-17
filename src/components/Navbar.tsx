"use client";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { ShoppingBag, Menu, X, MapPin, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/site.config";
import ThemeToggle from "@/components/ThemeToggle";
import TickerBanner, { Announcement } from "@/components/TickerBanner";
import CategoryBubbles, { CategoryBubble } from "@/components/CategoryBubbles";
import { SocialIcon, SOCIAL_BRAND_COLORS, normalizePlatformKey } from "@/components/SocialIcon";
import { buildMapsUrl } from "@/lib/maps";

export type HeaderSocialLink = { platform: string; url: string; active?: boolean; showInHeader?: boolean };

// Regroupe les liens de nav "genre" (Homme/Femme/Enfant) sous un seul menu "Collections" —
// recommandé côté SEO (une entrée de nav sémantique plutôt que plusieurs liens plats) et
// automatique : ajouter/retirer un lien `?genre=` dans Paramètres met le menu à jour sans code.
function splitCollectionsLinks(links: { href: string; label: string }[]) {
  const genreLinks = links.filter((l) => l.href.startsWith("/catalogue?genre="));
  const otherLinks = links.filter((l) => !l.href.startsWith("/catalogue?genre="));
  return { genreLinks, otherLinks };
}

function shortGenreLabel(label: string) {
  return label.replace(/^Collections\s*/i, "") || label;
}

export default function Navbar({
  brandName = siteConfig.brand.name,
  navLinks = siteConfig.navbar.links,
  announcements = [],
  socialLinks = [],
  address,
  categoryBubbles = [],
}: {
  brandName?: string;
  navLinks?: { href: string; label: string }[];
  announcements?: Announcement[];
  socialLinks?: HeaderSocialLink[];
  address?: string;
  categoryBubbles?: CategoryBubble[];
}) {
  const { cartCount, setCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const collectionsRef = useRef<HTMLDivElement>(null);

  const links = navLinks.filter((l) => {
    if (l.href === "/sur-mesure" && !siteConfig.features.customOrders) return false;
    return true;
  });
  const { genreLinks, otherLinks } = splitCollectionsLinks(links);

  const headerSocials = socialLinks.filter((s) => s.showInHeader && s.active !== false && s.url);
  const mapsUrl = address ? buildMapsUrl(address) : undefined;

  useEffect(() => {
    if (!collectionsOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [collectionsOpen]);

  return (
    <>
      <TickerBanner
        announcements={announcements}
        fallbackText={`${siteConfig.brand.banner} ${siteConfig.brand.bannerSymbol}`}
      />
      {/* Le fond reste noir dans les deux modes (identité de marque, "noir absolu") — le
          texte est donc fixé en clair ici, indépendamment de --foreground qui, lui,
          bascule avec le thème pour le reste du site. */}
      <header className="sticky top-0 z-40 border-b border-[var(--accent)] bg-black text-[#f5f1e8]">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 md:h-28">
          <Link href="/" className="flex items-center" aria-label={brandName}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteConfig.brand.logoUrl}
              alt={brandName}
              className="h-20 w-auto object-contain md:h-24"
            />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {otherLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--primary)]">
                {l.label}
              </Link>
            ))}
            {genreLinks.length > 0 && (
              <div ref={collectionsRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCollectionsOpen((o) => !o)}
                  className="flex items-center gap-1 hover:text-[var(--primary)]"
                  aria-expanded={collectionsOpen}
                >
                  Collections
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collectionsOpen ? "rotate-180" : ""}`} />
                </button>
                {collectionsOpen && (
                  <div className="absolute left-1/2 top-full z-50 mt-3 w-44 -translate-x-1/2 rounded-sm border border-[var(--accent)] bg-black py-2 shadow-2xl">
                    {genreLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setCollectionsOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-white/5 hover:text-[var(--primary)]"
                      >
                        {shortGenreLabel(l.label)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {(headerSocials.length > 0 || address) && (
              <div className="hidden items-center gap-3 border-r border-[var(--accent)]/40 pr-4 sm:flex">
                {headerSocials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    style={{ color: SOCIAL_BRAND_COLORS[normalizePlatformKey(s.platform)] }}
                    className="opacity-90 transition-opacity hover:opacity-100"
                  >
                    <SocialIcon platform={s.platform} className="h-4 w-4" />
                  </a>
                ))}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Nous trouver sur Google Maps"
                    title={address}
                    className="text-[var(--primary)] opacity-90 transition-opacity hover:opacity-100"
                  >
                    <MapPin className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Panier"
              className="relative hover:text-[var(--primary)]"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-[var(--background)]">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              className="md:hidden hover:text-[var(--primary)]"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <CategoryBubbles bubbles={categoryBubbles} />

      {/* Rendu en dehors du <header> : un ancêtre avec backdrop-blur/filter crée un
          "containing block" pour position:fixed, ce qui cassait la couverture plein écran
          du panneau (fond quasi transparent, texte superposé à la page en dessous). */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-l border-[var(--primary)]/30 bg-black p-6 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: "#0a0a0a", color: "#f5f1e8" }}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-serif text-lg tracking-wide">{brandName}</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" className="text-[#f5f1e8]/70 hover:text-[var(--primary)]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {otherLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-white/10 py-3.5 text-base font-medium uppercase tracking-wider text-[#f5f1e8] hover:text-[var(--primary)]"
              >
                {l.label}
              </Link>
            ))}
            {genreLinks.length > 0 && (
              <div className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setMobileCollectionsOpen((o) => !o)}
                  aria-expanded={mobileCollectionsOpen}
                  className="flex w-full items-center justify-between py-3.5 text-base font-medium uppercase tracking-wider text-[#f5f1e8] hover:text-[var(--primary)]"
                >
                  Collections
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileCollectionsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileCollectionsOpen && (
                  <div className="flex flex-col gap-1 pb-3">
                    {genreLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className="py-1.5 pl-4 text-sm uppercase tracking-wider text-[#f5f1e8]/75 hover:text-[var(--primary)]"
                      >
                        {shortGenreLabel(l.label)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {(headerSocials.length > 0 || mapsUrl) && (
            <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-5">
              {headerSocials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  style={{ color: SOCIAL_BRAND_COLORS[normalizePlatformKey(s.platform)] }}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  <SocialIcon platform={s.platform} className="h-5 w-5" />
                </a>
              ))}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Nous trouver sur Google Maps"
                  title={address}
                  className="ml-auto text-[var(--primary)] opacity-90 transition-opacity hover:opacity-100"
                >
                  <MapPin className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
