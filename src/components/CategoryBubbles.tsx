"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type CategoryBubble = { label: string; href: string; imageUrl?: string };

function Bubble({ b, ariaHidden }: { b: CategoryBubble; ariaHidden?: boolean }) {
  return (
    <Link
      href={b.href}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
      draggable={false}
      className="group mx-4 flex w-16 flex-shrink-0 select-none flex-col items-center gap-1.5 sm:w-20"
    >
      <div className="h-14 w-14 overflow-hidden rounded-full bg-[var(--muted)] ring-1 ring-[var(--accent)] transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
        {b.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={b.imageUrl} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-lg text-[var(--primary)]/60">
            {b.label?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <span className="text-center text-[10px] font-medium uppercase tracking-wide text-[var(--foreground)]/80 group-hover:text-[var(--primary)]">
        {b.label}
      </span>
    </Link>
  );
}

const AUTO_SCROLL_SPEED = 0.4; // px/frame (~24px/s à 60fps)
const RESUME_DELAY = 2500; // ms avant reprise du défilement auto après une interaction manuelle

// Rangée de catégories en bulles, sous le header — admin-éditable depuis Paramètres
// (settings.categoryBubbles). Défile automatiquement (scrollLeft piloté en JS, pas de CSS
// animation) ET se scrolle manuellement : swipe tactile natif, molette/trackpad natifs, et
// glisser-déposer à la souris (non natif sur overflow-x-auto, géré via Pointer Events). Le
// groupe de bulles est répété assez de fois pour dépasser la largeur de l'écran, sinon il n'y
// a tout simplement rien à faire défiler ; on rembobine après un groupe complet, la suite
// étant identique au pixel près. Masquée si la liste est vide.
export default function CategoryBubbles({ bubbles }: { bubbles: CategoryBubble[] }) {
  const items = (bubbles || []).filter((b) => b.label?.trim() && b.href?.trim());
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragRef = useRef({ dragging: false, startX: 0, startScroll: 0, moved: false });
  // Position réelle en flottant : `scrollLeft` est arrondi par le navigateur, donc relire la
  // valeur qu'on vient d'écrire ferait perdre l'incrément (0,4 px/frame ramené à 0) et le
  // bandeau resterait figé. On garde donc la position de référence ici.
  const posRef = useRef(0);
  const [repeats, setRepeats] = useState(2);

  // Nombre de copies nécessaires pour que le contenu déborde franchement (deux largeurs
  // d'écran), recalculé quand la taille change — sans débordement, aucun défilement possible.
  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group) return;
    function measure() {
      const groupWidth = group!.offsetWidth;
      if (groupWidth <= 0) return;
      setRepeats(Math.max(2, Math.ceil((track!.clientWidth * 2) / groupWidth)));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(group);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number;
    function step() {
      if (!track) return;
      if (pausedRef.current) {
        // L'utilisateur a la main : on se recale sur sa position avant de reprendre.
        posRef.current = track.scrollLeft;
      } else {
        const groupWidth = groupRef.current?.offsetWidth || 0;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (groupWidth > 0 && maxScroll > 1) {
          let next = posRef.current + AUTO_SCROLL_SPEED;
          if (next >= groupWidth) next -= groupWidth;
          posRef.current = next;
          track.scrollLeft = next;
        }
      }
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [items.length, repeats]);

  function pause() {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  }
  function scheduleResume() {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // tactile : scroll natif au swipe
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { dragging: true, startX: e.clientX, startScroll: track.scrollLeft, moved: false };
    pause();
    track.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 3) dragRef.current.moved = true;
    track.scrollLeft = dragRef.current.startScroll - dx;
  }
  function endDrag() {
    if (dragRef.current.dragging) {
      dragRef.current.dragging = false;
      scheduleResume();
    }
  }
  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-[var(--accent)] bg-[var(--background)] py-3">
      <div
        ref={trackRef}
        className="bubbles-track flex cursor-grab select-none overflow-x-auto active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onMouseEnter={pause}
        onMouseLeave={scheduleResume}
        onTouchStart={pause}
        onTouchEnd={scheduleResume}
        onWheel={() => {
          pause();
          scheduleResume();
        }}
      >
        {Array.from({ length: repeats }, (_, rep) => (
          <div
            key={rep}
            ref={rep === 0 ? groupRef : undefined}
            className="bubbles-track-group flex flex-none"
          >
            {items.map((b, i) => (
              <Bubble key={`${rep}-${i}`} b={b} ariaHidden={rep > 0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
