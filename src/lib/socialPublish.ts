const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export type SocialPublishInput = {
  imageUrl: string;
  name: string;
  longDesc?: string;
  hashtags?: string[];
};

export type SocialPublishResult = {
  facebookPostId?: string;
  instagramPostId?: string;
  errors: string[];
};

function buildCaption({ name, longDesc, hashtags }: SocialPublishInput): string {
  const parts = [name];
  if (longDesc) parts.push(longDesc);
  if (hashtags?.length) parts.push(hashtags.join(" "));
  return parts.join("\n\n");
}

async function graphPost(path: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Erreur Graph API (${res.status})`);
  }
  return data;
}

async function publishToFacebookPage(imageUrl: string, caption: string): Promise<string> {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    throw new Error("Configuration Facebook manquante (META_PAGE_ID / META_PAGE_ACCESS_TOKEN)");
  }
  const data = await graphPost(`${pageId}/photos`, { url: imageUrl, caption, access_token: token });
  return data.post_id || data.id;
}

async function publishToInstagram(imageUrl: string, caption: string): Promise<string> {
  const igId = process.env.META_IG_BUSINESS_ACCOUNT_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!igId || !token) {
    throw new Error(
      "Configuration Instagram manquante (META_IG_BUSINESS_ACCOUNT_ID / META_PAGE_ACCESS_TOKEN)"
    );
  }
  const created = await graphPost(`${igId}/media`, { image_url: imageUrl, caption, access_token: token });
  const published = await graphPost(`${igId}/media_publish`, {
    creation_id: created.id,
    access_token: token,
  });
  return published.id;
}

/**
 * Publie une fiche produit sur Facebook et Instagram en parallèle. Chaque canal est tenté
 * indépendamment : l'échec de l'un n'empêche pas l'autre. Le résultat est "réussi" dès qu'au
 * moins un canal a publié — les erreurs individuelles sont remontées pour affichage admin.
 */
export async function publishProductToSocial(input: SocialPublishInput): Promise<SocialPublishResult> {
  const caption = buildCaption(input);
  const errors: string[] = [];
  let facebookPostId: string | undefined;
  let instagramPostId: string | undefined;

  const [fb, ig] = await Promise.allSettled([
    publishToFacebookPage(input.imageUrl, caption),
    publishToInstagram(input.imageUrl, caption),
  ]);

  if (fb.status === "fulfilled") facebookPostId = fb.value;
  else errors.push(`Facebook : ${fb.reason?.message || fb.reason}`);

  if (ig.status === "fulfilled") instagramPostId = ig.value;
  else errors.push(`Instagram : ${ig.reason?.message || ig.reason}`);

  return { facebookPostId, instagramPostId, errors };
}
