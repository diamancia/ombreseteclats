"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const THUMB =
  "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--primary)] " +
  "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto " +
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--primary)] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto";

export default function PriceRangeSlider({
  min,
  max,
  lo,
  hi,
  hrefFor,
}: {
  min: number;
  max: number;
  lo: number;
  hi: number;
  hrefFor: (lo: number, hi: number) => string;
}) {
  const router = useRouter();
  const [vLo, setVLo] = useState(lo);
  const [vHi, setVHi] = useState(hi);

  function commit(nextLo: number, nextHi: number) {
    router.push(hrefFor(nextLo, nextHi));
  }

  const pctLo = max > min ? ((vLo - min) / (max - min)) * 100 : 0;
  const pctHi = max > min ? ((vHi - min) / (max - min)) * 100 : 100;

  return (
    <div className="w-full max-w-xs">
      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[var(--accent)] ring-1 ring-[var(--primary)]/30" />
        <div
          className="pointer-events-none absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[var(--primary)]"
          style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={vLo}
          onChange={(e) => setVLo(Math.min(Number(e.target.value), vHi))}
          onMouseUp={() => commit(vLo, vHi)}
          onTouchEnd={() => commit(vLo, vHi)}
          onKeyUp={() => commit(vLo, vHi)}
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent ${THUMB}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={vHi}
          onChange={(e) => setVHi(Math.max(Number(e.target.value), vLo))}
          onMouseUp={() => commit(vLo, vHi)}
          onTouchEnd={() => commit(vLo, vHi)}
          onKeyUp={() => commit(vLo, vHi)}
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent ${THUMB}`}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-[var(--primary)]">
        <span>{vLo}€</span>
        <span>{vHi >= max ? `${max}€ +` : `${vHi}€`}</span>
      </div>
    </div>
  );
}
