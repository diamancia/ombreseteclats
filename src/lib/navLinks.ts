import { siteConfig } from "@/site.config";

export type NavLinkItem = { href: string; label: string };

// Masque les liens dont la fonctionnalité est désactivée (ex: "Sur-mesure") — partagé entre
// Navbar et Footer pour ne jamais afficher un lien mort dans l'un des deux.
export function filterActiveNavLinks(links: NavLinkItem[]): NavLinkItem[] {
  return links.filter((l) => {
    if (l.href === "/sur-mesure" && !siteConfig.features.customOrders) return false;
    return true;
  });
}

// Regroupe les liens de nav "genre" (Homme/Femme/Enfant) sous un seul menu "Collections" —
// recommandé côté SEO (une entrée de nav sémantique plutôt que plusieurs liens plats) et
// automatique : ajouter/retirer un lien `?genre=` dans Paramètres met le menu à jour sans code.
export function splitCollectionsLinks(links: NavLinkItem[]) {
  const genreLinks = links.filter((l) => l.href.startsWith("/catalogue?genre="));
  const otherLinks = links.filter((l) => !l.href.startsWith("/catalogue?genre="));
  return { genreLinks, otherLinks };
}

export function shortGenreLabel(label: string): string {
  return label.replace(/^Collections\s*/i, "") || label;
}
