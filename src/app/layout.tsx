import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import CookieBanner from "@/components/CookieBanner";
import { siteConfig } from "@/site.config";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
};

const themeVars = `:root{
  --background:${siteConfig.theme.background};
  --foreground:${siteConfig.theme.foreground};
  --primary:${siteConfig.theme.primary};
  --primary-dark:${siteConfig.theme.primaryDark};
  --accent:${siteConfig.theme.accent};
  --muted:${siteConfig.theme.muted};
  --rose-gold:${siteConfig.theme.roseGold};
}
:root[data-theme="light"]{
  --background:${siteConfig.theme.light.background};
  --foreground:${siteConfig.theme.light.foreground};
  --primary:${siteConfig.theme.light.primary};
  --primary-dark:${siteConfig.theme.light.primaryDark};
  --accent:${siteConfig.theme.light.accent};
  --muted:${siteConfig.theme.light.muted};
}`;

const THEME_STORAGE_KEY = `${siteConfig.brand.storagePrefix}_theme`;
// Appliqué avant le premier rendu pour éviter un flash sombre→clair au chargement.
const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t==="light")document.documentElement.setAttribute("data-theme","light");}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
