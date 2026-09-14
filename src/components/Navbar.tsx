"use client";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { ShoppingBag, Menu, X, MapPin } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/site.config";
import ThemeToggle from "@/components/ThemeToggle";
import TickerBanner, { Announcement } from "@/components/TickerBanner";
import { SocialIcon, SOCIAL_BRAND_COLORS, normalizePlatformKey } from "@/components/SocialIcon";

export type HeaderSocialLink = { platform: string; url: string; active?: boolean; showInHeader?: boolean };

export default function Navbar({
  brandName = siteConfig.brand.name,
  navLinks = siteConfig.navbar.links,
  announcements = [],
  socialLinks = [],
  address,
}: {
  brandName?: string;
  navLinks?: { href: string; label: string }[];
  announcements?: Announcement[];
  socialLinks?: HeaderSocialLink[];
  address?: string;
}) {
  const { cartCount, setCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = navLinks.filter((l) => {
    if (l.href === "/sur-mesure" && !siteConfig.features.customOrders) return false;
    return true;
  });

  const headerSocials = socialLinks.filter((s) => s.showInHeader && s.active !== false && s.url);

  return (
    <>
      <TickerBanner
        announcements={announcements}
        fallbackText={`${siteConfig.brand.banner} ${siteConfig.brand.bannerSymbol}`}
      />
      {/* Le fond reste noir dans les deux modes (identité de marque, "noir absolu") — le
          texte est donc fixé en clair ici, indépendamment de --foreground qui, lui,
          bascule avec le thème pour le reste du site. */}
      <header className="sticky top-0 z-40 border-b border-[var(--accent)] bg-black/95 text-[#f5f1e8] backdrop-blur">
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
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--primary)]">
                {l.label}
              </Link>
            ))}
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
                {address && (
                  <Link
                    href="/#contact"
                    aria-label="Notre adresse"
                    title={address}
                    className="text-[var(--primary)] opacity-90 transition-opacity hover:opacity-100"
                  >
                    <MapPin className="h-4 w-4" />
                  </Link>
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

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="flex-1 bg-black/70" onClick={() => setMobileOpen(false)} />
            <aside
              className="w-72 border-l border-[var(--accent)] p-6 shadow-2xl"
              style={{ backgroundColor: "#0a0a0a", color: "#f5f1e8" }}
            >
              <button onClick={() => setMobileOpen(false)} className="mb-6 ml-auto block">
                <X className="h-5 w-5" />
              </button>
              <nav className="space-y-4">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-lg font-medium hover:text-[var(--primary)]"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}
      </header>
    </>
  );
}
