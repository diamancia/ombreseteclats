import { Star, ExternalLink } from "lucide-react";
import { getGoogleReviews, writeReviewUrl, type GoogleReview } from "@/lib/googleReviews";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          fill={i < filled ? "var(--gr-accent)" : "none"}
          stroke="var(--gr-accent)"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <article
      className="flex w-[168px] shrink-0 flex-col gap-2 rounded-[10px] p-3 sm:w-[196px]"
      style={{ background: "var(--gr-card)", border: "1px solid var(--gr-border)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
          style={{ background: "var(--gr-accent)", color: "var(--gr-card)" }}
        >
          {initials(review.authorName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium" style={{ color: "var(--gr-text)" }}>
            {review.authorName}
          </p>
          <p className="font-mono text-[10px]" style={{ color: "var(--gr-text-secondary)" }}>
            {review.relativeTime}
          </p>
        </div>
      </div>
      <Stars rating={review.rating} />
      <p className="line-clamp-3 text-xs leading-relaxed" style={{ color: "var(--gr-text)" }}>
        {review.text}
      </p>
    </article>
  );
}

export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  if (!data || data.reviews.length === 0) return null;

  const placeId = process.env.GOOGLE_PLACE_ID;
  const reviewHref = placeId ? writeReviewUrl(placeId) : undefined;

  return (
    <section
      className="reviews-section border-t"
      style={{ background: "var(--gr-bg)", borderColor: "var(--gr-border)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--gr-accent)" }}>
              Google Business Profile
            </p>
            <h2 className="font-serif text-3xl tracking-wider" style={{ color: "var(--gr-text)" }}>
              AVIS CLIENTS
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <Stars rating={data.rating} size={16} />
              <span className="text-sm font-semibold" style={{ color: "var(--gr-text)" }}>
                {data.rating.toFixed(1)}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--gr-text-secondary)" }}>
                · {data.totalReviews} avis
              </span>
            </div>
          </div>
          {reviewHref && (
            <a
              href={reviewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90"
              style={{ background: "var(--gr-accent)", color: "var(--gr-card)" }}
            >
              Laisser un avis sur Google
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Défilement continu type "train" : deux groupes identiques mis bout à bout, on
          translate le tout de -50% pour boucler sans à-coup (même technique que le bandeau
          d'annonces du header). Sous prefers-reduced-motion, le second groupe est masqué et
          le premier repasse en grille statique qui s'enroule à la ligne (globals.css). */}
      <div className="reviews-viewport overflow-hidden pb-16">
        <div className="reviews-track flex w-fit gap-4 px-4 sm:px-6">
          <div className="reviews-track-group flex gap-4">
            {data.reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
          <div className="reviews-track-group flex gap-4" aria-hidden="true">
            {data.reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
