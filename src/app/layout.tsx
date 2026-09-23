import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import CookieBanner from "@/components/CookieBanner";
import { siteConfig } from "@/site.config";

// Couple typographique de design/mockup-mobile-flow.html : Cormorant Garamond pour les titres
// (.font-serif), Jost pour le texte courant. Les 34 fichiers qui utilisent déjà `font-serif`
// basculent sans être touchés.
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
};

// Un seul thème (mode sombre retiré) — variables CSS générées depuis site.config.ts pour
// garder le système multi-verticaux (chaque site/client a sa propre palette).
const themeVars = `:root{
  --background:${siteConfig.theme.background};
  --foreground:${siteConfig.theme.foreground};
  --primary:${siteConfig.theme.primary};
  --primary-dark:${siteConfig.theme.primaryDark};
  --accent:${siteConfig.theme.accent};
  --muted:${siteConfig.theme.muted};
  --rose-gold:${siteConfig.theme.roseGold};
  --card:${siteConfig.theme.card};
  --gold-pale:${siteConfig.theme.goldPale};
  --ink-soft:${siteConfig.theme.inkSoft};
  --ink-faint:${siteConfig.theme.inkFaint};
}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jost.variable} ${cormorant.variable} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}