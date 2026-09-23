"use client";

// Ruban latéral minimal, page d'accueil uniquement — ce composant n'est monté que par
// `src/app/page.tsx`, qui est exclusivement la route "/" dans l'App Router : pas besoin de
// vérifier le chemin en JS, le fichier lui-même garantit qu'aucune autre page ne le rend.
export default function ShopRibbon({ targetId = "boutique" }: { targetId?: string }) {
  function scrollToShop() {
    const target = document.getElementById(targetId);
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={scrollToShop}
      aria-label="Aller à la boutique"
      // z-20 : sous le bouton WhatsApp (ContactButton.tsx, z-30) au cas où un écran très court
      // les rapprocherait ; centré verticalement, donc naturellement loin de lui en pratique.
      className="fixed right-0 top-1/2 z-20 flex min-h-11 -translate-y-1/2 items-center justify-center rounded-l-sm bg-[var(--foreground)] px-1.5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--primary)] shadow-md transition-[translate,filter] duration-200 ease-out hover:-translate-x-[3px] hover:brightness-90 focus-visible:-translate-x-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
      style={{ writingMode: "vertical-rl" }}
    >
      Boutique
    </button>
  );
}
