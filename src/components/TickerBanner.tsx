"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Announcement = {
  text: string;
  link?: string;
  expiresAt?: string;
  active?: boolean;
};

function formatTimeLeft(expiresAt: string): string | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function AnnouncementItem({ a, ariaHidden }: { a: Announcement; ariaHidden?: boolean }) {
  const [left, setLeft] = useState<string | null>(a.expiresAt ? formatTimeLeft(a.expiresAt) : null);

  useEffect(() => {
    if (!a.expiresAt) return;
    const id = setInterval(() => setLeft(formatTimeLeft(a.expiresAt!)), 1000);
    return () => clearInterval(id);
  }, [a.expiresAt]);

  if (a.expiresAt && left === null) return null;

  const content = (
    <span className="mx-6 inline-flex items-center gap-2">
      {a.text}
      {left && (
        <span className="rounded-full bg-black/15 px-2 py-0.5 text-[9px] font-bold tracking-normal">
          ⏱ {left}
        </span>
      )}
    </span>
  );

  if (a.link) {
    return (
      <Link href={a.link} aria-hidden={ariaHidden} className="hover:underline">
        {content}
      </Link>
    );
  }
  return <span aria-hidden={ariaHidden}>{content}</span>;
}

export default function TickerBanner({
  announcements = [],
  fallbackText,
}: {
  announcements?: Announcement[];
  fallbackText: string;
}) {
  const active = announcements.filter((a) => a.active !== false && a.text?.trim());
  const items: Announcement[] = active.length > 0 ? active : [{ text: fallbackText }];

  return (
    <div className="overflow-hidden bg-[var(--primary)] py-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-black">
      <div className="ticker-track flex w-max">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex flex-none items-center whitespace-nowrap">
            {items.map((a, i) => (
              <AnnouncementItem key={`${rep}-${i}`} a={a} ariaHidden={rep === 1} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
