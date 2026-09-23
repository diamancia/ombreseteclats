"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Rangée de cartes qui défile horizontalement : flèches rondes sur les côtés (masquées
// quand on est déjà au bout), glisser/swipe natif, accroche sur chaque carte. Le défilement
// se fait toujours d'une "page" visible, quelle que soit la largeur d'écran.
export default function ProductCarousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  function refreshBounds() {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);
  }

  useEffect(() => {
    refreshBounds();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(refreshBounds);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={refreshBounds}
        className="carousel-track -mx-1 flex gap-4 overflow-x-auto px-1 pb-2 sm:gap-6"
      >
        {children}
      </div>

      {!atStart && <Arrow side="left" onClick={() => scrollByPage(-1)} />}
      {!atEnd && <Arrow side="right" onClick={() => scrollByPage(1)} />}
    </div>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Voir les pièces précédentes" : "Voir les pièces suivantes"}
      className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--background)]/95 text-[var(--foreground)] shadow-md transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] sm:flex ${
        side === "left" ? "-left-3" : "-right-3"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
