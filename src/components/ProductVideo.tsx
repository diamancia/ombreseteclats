// Extrait l'ID YouTube depuis les formats d'URL courants (watch?v=, youtu.be/, shorts/, embed/).
// Renvoie null si l'URL n'est pas reconnue comme YouTube — dans ce cas on affiche un <video>
// natif (lien de fichier direct : mp4, webm...).
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const match = u.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
      if (match) return match[2];
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProductVideo({ url }: { url?: string | null }) {
  if (!url?.trim()) return null;
  const youtubeId = extractYouTubeId(url.trim());

  return (
    <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
      {youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Vidéo produit"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={url} controls className="h-full w-full object-contain" />
      )}
    </div>
  );
}
