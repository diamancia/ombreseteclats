"use client";
import { useState } from "react";

export default function PromoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--muted)]">
        <span className="text-[10px] uppercase tracking-widest text-[#f5f1e8]/40">Photo à venir</span>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-[var(--muted)] shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-14 w-14 overflow-hidden rounded-md ring-2 transition-colors ${
                i === active ? "ring-[var(--rose-gold)]" : "ring-transparent hover:ring-[var(--rose-gold)]/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
