import { db, throwIfError } from "./client";

export const GOOGLE_REVIEWS_CACHE_ID = "00000000-0000-0000-0000-000000000002";

export type GoogleReviewsCacheRow = {
  rating: number;
  totalReviews: number;
  reviews: { authorName: string; rating: number; relativeTime: string; text: string; time: number }[];
  fetchedAt: string;
};

function fromDb(row: any): GoogleReviewsCacheRow {
  return {
    rating: row.rating || 0,
    totalReviews: row.total_reviews || 0,
    reviews: row.reviews || [],
    fetchedAt: row.fetched_at,
  };
}

export async function getGoogleReviewsCache(): Promise<GoogleReviewsCacheRow | null> {
  const { data, error } = await db()
    .from("google_reviews_cache")
    .select("*")
    .eq("id", GOOGLE_REVIEWS_CACHE_ID)
    .maybeSingle();
  if (error) throw error;
  return data ? fromDb(data) : null;
}

export async function setGoogleReviewsCache(patch: {
  rating: number;
  totalReviews: number;
  reviews: any[];
}): Promise<void> {
  throwIfError(
    await db()
      .from("google_reviews_cache")
      .upsert(
        {
          id: GOOGLE_REVIEWS_CACHE_ID,
          rating: patch.rating,
          total_reviews: patch.totalReviews,
          reviews: patch.reviews,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
  );
}
