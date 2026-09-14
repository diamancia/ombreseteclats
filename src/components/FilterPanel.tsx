"use client";
import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";

export type ActiveChip = { label: string; removeHref: string };

export default function FilterPanel({
  children,
  activeChips,
  clearHref,
}: {
  children: React.ReactNode;
  activeChips: ActiveChip[];
  clearHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-[var(--primary)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-[var(--background)]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtrer
          {activeChips.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-[var(--background)]">
              {activeChips.length}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {activeChips.map((c) => (
          <Link
            key={c.label}
            href={c.removeHref}
            className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] text-[var(--foreground)]/70 transition-colors hover:text-[var(--primary)]"
          >
            {c.label} <X className="h-3 w-3" />
          </Link>
        ))}
        {activeChips.length > 0 && (
          <Link
            href={clearHref}
            className="text-[11px] uppercase tracking-wider text-[var(--foreground)]/40 underline hover:text-[var(--primary)]"
          >
            Tout effacer
          </Link>
        )}
      </div>
      {open && <div className="mt-6 space-y-5 rounded-2xl bg-[var(--muted)] p-6">{children}</div>}
    </div>
  );
}
