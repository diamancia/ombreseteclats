import { getGoogleReviewsCache, setGoogleReviewsCache } from "@/lib/db";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h — évite d'appeler l'API à chaque visite.

export type GoogleReview = {
  authorName: string;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
};

export type GoogleReviewsData = {
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
};

// Lien stable "Laisser un avis" — le format officiel Google basé sur le Place ID, plutôt
// qu'un lien de résultats de recherche personnel (expire, contient des paramètres de
// session propres à l'utilisateur qui l'a copié).
export function writeReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

function normalizeCached(cached: any): GoogleReviewsData {
  return {
    rating: cached.rating || 0,
    totalReviews: cached.totalReviews || 0,
    reviews: (cached.reviews || []).map((r: any) => ({
      authorName: r.authorName || "Client",
      rating: r.rating || 0,
      relativeTime: r.relativeTime || "",
      text: r.text || "",
      time: r.time || 0,
    })),
  };
}

async function fetchFromGoogle(apiKey: string, placeId: string): Promise<GoogleReviewsData> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "rating,user_ratings_total,reviews");
  url.searchParams.set("language", "fr");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Google Places HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Google Places status ${data.status}`);

  const result = data.result || {};
  const reviews: GoogleReview[] = (result.reviews || []).map((r: any) => ({
    authorName: r.author_name || "Client",
    rating: r.rating || 0,
    relativeTime: r.relative_time_description || "",
    text: r.text || "",
    time: r.time || 0,
  }));

  return {
    rating: result.rating || 0,
    totalReviews: result.user_ratings_total || 0,
    reviews,
  };
}

// Sert le cache (base de données) et le rafraîchit en arrière-plan quand il est périmé —
// si l'appel Google échoue (clé absente, quota, panne), on continue à servir la dernière
// valeur connue au lieu de casser la section. Ne retourne null que si aucune donnée n'a
// jamais été récupérée avec succès.
export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  const cached = await getGoogleReviewsCache();
  const isFresh = cached && Date.now() - new Date(cached.fetchedAt || 0).getTime() < CACHE_TTL_MS;

  if (isFresh) {
    return normalizeCached(cached);
  }

  if (!apiKey || !placeId) {
    // Pas de credentials configurés : on sert quand même un cache existant (démo/staging),
    // sinon la section se masque proprement côté composant.
    if (cached) return normalizeCached(cached);
    return null;
  }

  try {
    const fresh = await fetchFromGoogle(apiKey, placeId);
    await setGoogleReviewsCache(fresh);
    return fresh;
  } catch {
    // Échec de l'appel API : on garde le dernier résultat en cache plutôt que de casser
    // la section — seulement null si on n'a jamais rien récupéré avec succès.
    if (cached) return normalizeCached(cached);
    return null;
  }
}
