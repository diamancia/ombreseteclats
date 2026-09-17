"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
// glisser-déposer à la souris (non natif sur overflow-x-auto, géré via Pointer Events). Deux
// copies des bulles dans le track pour boucler sans à-coup — on rembobine à la moitié de la
// largeur totale. Masquée si la liste est vide.
export default function CategoryBubbles({ bubbles }: { bubbles: CategoryBubble[] }) {
  const items = (bubbles || []).filter((b) => b.label?.trim() && b.href?.trim());
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragRef = useRef({ dragging: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number;
    function step() {
      if (!pausedRef.current && track) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          track.scrollLeft += AUTO_SCROLL_SPEED;
          if (track.scrollLeft >= half) track.scrollLeft -= half;
        }
      }
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [items.length]);

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
        {[0, 1].map((rep) => (
          <div key={rep} className="bubbles-track-group flex flex-none">
            {items.map((b, i) => (
              <Bubble key={`${rep}-${i}`} b={b} ariaHidden={rep === 1} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
