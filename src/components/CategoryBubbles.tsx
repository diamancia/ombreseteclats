import Link from "next/link";

export type CategoryBubble = { label: string; href: string; imageUrl?: string };

function Bubble({ b, ariaHidden }: { b: CategoryBubble; ariaHidden?: boolean }) {
  return (
    <Link
      href={b.href}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
      className="group mx-4 flex w-16 flex-shrink-0 flex-col items-center gap-1.5 sm:w-20"
    >
      <div className="h-14 w-14 overflow-hidden rounded-full bg-[var(--muted)] ring-1 ring-[var(--accent)] transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
        {b.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
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

// Rangée de catégories en bulles, défilant en boucle juste sous le header — admin-éditable
// depuis Paramètres (settings.categoryBubbles). Masquée si la liste est vide.
export default function CategoryBubbles({ bubbles }: { bubbles: CategoryBubble[] }) {
  const items = (bubbles || []).filter((b) => b.label?.trim() && b.href?.trim());
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-[var(--accent)] bg-[var(--background)] py-3">
      <div className="bubbles-track flex w-max">
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
