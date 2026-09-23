"use client";
import Link from "next/link";

// Ruban latéral minimal, page d'accueil uniquement — ce composant n'est monté que par
// `src/app/page.tsx`, qui est exclusivement la route "/" dans l'App Router : pas besoin de
// vérifier le chemin en JS, le fichier lui-même garantit qu'aucune autre page ne le rend.
//
// Emmène vers /catalogue (la vraie page boutique), pas un ancrage dans la page d'accueil :
// c'est déjà ainsi que "Boutique" est utilisé partout ailleurs sur le site (menu du haut,
// pied de page, titre de la page catalogue elle-même) — un scroll vers une section de
// l'accueil aurait été une destination différente de ce que "Boutique" désigne réellement.
export default function ShopRibbon() {
  return (
    <Link
      href="/catalogue"
      aria-label="Aller à la boutique"
      // z-20 : sous le bouton WhatsApp (ContactButton.tsx, z-30) au cas où un écran très court
      // les rapprocherait ; centré verticalement, donc naturellement loin de lui en pratique.
      // `active:` en plus de `hover:`/`focus-visible:` : sur mobile/tactile il n'y a pas de
      // survol, le retour visuel doit donc aussi passer par l'état pressé.
      className="fixed right-0 top-1/2 z-20 flex min-h-11 -translate-y-1/2 items-center justify-center rounded-l-sm bg-[var(--foreground)] px-1.5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--primary)] shadow-md transition-[translate,background-color] duration-200 ease-out hover:-translate-x-[3px] hover:bg-[#1c1712] active:-translate-x-[3px] active:bg-[#1c1712] focus-visible:-translate-x-[3px] focus-visible:bg-[#1c1712] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
      style={{ writingMode: "vertical-rl" }}
    >
      Boutique
    </Link>
  );
}
