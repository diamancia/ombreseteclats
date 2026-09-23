"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type HeroSlide = {
  imageUrl: string;
  ctaLabel?: string;
  ctaLink?: string;
  ctaAlign?: "left" | "center" | "right";
};

const DEFAULT_INTERVAL_MS = 5000;

const CTA_POSITION: Record<"left" | "center" | "right", string> = {
  left: "left-4",
  center: "left-1/2 -translate-x-1/2",
  right: "right-4",
};

// Habillage par défaut : carré centré, conservé à l'identique pour que tout appelant qui ne
// passe pas `className` garde exactement le rendu précédent.
const DEFAULT_CLASS =
  "relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-sm ring-1 ring-[var(--primary)]/20";

// Carrousel de photos du Hero (remplace l'image unique quand des slides sont configurées
// depuis Paramètres > Hero). Défilement auto (vitesse réglable admin), pause au
// survol/interaction, points de pagination cliquables, CTA propre à chaque photo (texte,
// lien et alignement gauche/centre/droite, toujours ancré en bas). Une seule photo = pas de
// points ni d'autoplay (rendu identique à une image statique).
export default function HeroSlider({
  slides,
  intervalMs = DEFAULT_INTERVAL_MS,
  className = DEFAULT_CLASS,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const items = slides.filter((s) => s.imageUrl?.trim());

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((i) => (i + 1) % items.length);
    }, Math.max(1000, intervalMs));
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;
  const slide = items[Math.min(active, items.length - 1)];
  const ctaPosition = CTA_POSITION[slide.ctaAlign || "center"];

  return (
    <div
      className={className}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {items.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={s.imageUrl}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* CTA propre à la photo — masqué en mobile, où le Hero porte déjà un CTA unique centré
          par-dessus l'image (deux boutons superposés seraient illisibles). Le réglage admin
          (libellé, lien, alignement) reste pleinement actif en desktop. */}
      {slide.ctaLabel?.trim() && slide.ctaLink?.trim() && (
        <Link
          href={slide.ctaLink}
          className={`absolute bottom-10 hidden whitespace-nowrap rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] hover:bg-[var(--primary-dark)] hover:text-[var(--background)] lg:inline-block ${ctaPosition}`}
        >
          {slide.ctaLabel}
        </Link>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-2 w-2 rounded-full ring-1 ring-black/10 transition-colors ${
                i === active ? "bg-white" : "bg-white/45"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
