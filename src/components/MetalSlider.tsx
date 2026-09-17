"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Couleur de piste par métal — dégradé visuel demandé : or jaune -> gris/rose -> argenté -> perle.
const METAL_SWATCH: Record<string, string> = {
  or9: "#D9B65C",
  or14: "#E0BE63",
  or: "#E8C46B",
  or22: "#EFCD79",
  or24: "#F4D485",
  argent: "#C7CCD1",
  perles: "#F3ECE3",
};

export default function MetalSlider({
  metalTypes,
  value,
  hrefFor,
}: {
  metalTypes: { key: string; label: string }[];
  value?: string;
  hrefFor: (metalKey?: string) => string;
}) {
  const router = useRouter();
  // Position 0 = "Tous", puis un cran par métal, dans l'ordre fourni.
  const stops = [{ key: undefined as string | undefined, label: "Tous" }, ...metalTypes];
  const currentIndex = Math.max(
    0,
    stops.findIndex((s) => s.key === value)
  );
  const [pos, setPos] = useState(currentIndex);

  const gradient = `linear-gradient(to right, #e5e0da, ${metalTypes.map((m) => METAL_SWATCH[m.key] || "#cfcfcf").join(", ")})`;

  return (
    <div className="w-full max-w-xs">
      <div className="relative flex h-6 items-center">
        <div
          className="pointer-events-none absolute inset-x-0 h-2.5 rounded-full ring-1 ring-black/15"
          style={{ background: gradient }}
        />
        <input
          type="range"
          min={0}
          max={stops.length - 1}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          onMouseUp={() => router.push(hrefFor(stops[pos]?.key))}
          onTouchEnd={() => router.push(hrefFor(stops[pos]?.key))}
          onKeyUp={() => router.push(hrefFor(stops[pos]?.key))}
          className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--primary)]
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--primary)] [&::-moz-range-thumb]:bg-white"
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/70">
        {stops.map((s, i) => (
          <span key={s.key || "tous"} className={i === pos ? "text-[var(--primary)]" : ""}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
