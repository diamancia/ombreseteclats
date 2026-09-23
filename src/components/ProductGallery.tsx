"use client";
import { useState } from "react";
import { ZoomIn } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

export default function ProductGallery({
  images,
  alt,
  badges,
}: {
  images: string[];
  alt: string;
  badges?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const main = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)] to-white shadow-lg">
        {badges}
        {main ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main}
              alt={alt}
              onClick={() => setZoomOpen(true)}
              className="h-full w-full cursor-zoom-in object-cover"
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoomer sur la photo"
              className="absolute bottom-3 right-3 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-9xl">🍰</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                active === i ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--accent)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && <ImageLightbox images={images} initialIndex={active} alt={alt} onClose={() => setZoomOpen(false)} />}
    </div>
  );
}
