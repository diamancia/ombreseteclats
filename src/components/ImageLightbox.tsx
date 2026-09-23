"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Visionneuse plein écran (vignettes catalogue + fiche produit) :
// - fond sombre, croix de fermeture blanche très visible en haut à droite
// - clic en dehors de la photo (fond ou marge autour de l'image) ferme
// - défilement horizontal natif (scroll-snap) entre les photos, jamais bloqué — swipe au
//   doigt sur mobile, molette/trackpad sur desktop, comme Amazon/Shein
// - clic/tap sur la photo elle-même bascule un zoom x1.6 centré, sans fermer la visionneuse
export default function ImageLightbox({
  images,
  initialIndex = 0,
  alt = "",
  onClose,
}: {
  images: string[];
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = initialIndex * track.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2.5 text-white ring-1 ring-white/30 hover:bg-black/70"
      >
        <X className="h-6 w-6" />
      </button>

      <div ref={trackRef} className="flex h-full w-full snap-x snap-mandatory overflow-x-auto">
        {images.map((src, i) => (
          <div key={i} className="flex h-full w-full flex-shrink-0 snap-center items-center justify-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onClick={(e) => {
                e.stopPropagation();
                setZoomedIndex(zoomedIndex === i ? null : i);
              }}
              className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
                zoomedIndex === i ? "scale-[1.6] cursor-zoom-out" : "cursor-zoom-in"
              }`}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/60" />
          ))}
        </div>
      )}
    </div>
  );
}
