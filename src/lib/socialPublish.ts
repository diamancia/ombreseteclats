const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export type SocialPublishInput = {
  imageUrl: string;
  name: string;
  longDesc?: string;
  hashtags?: string[];
  productUrl?: string;
};

export type SocialPublishResult = {
  facebookPostId?: string;
  instagramPostId?: string;
  pinterestPinId?: string;
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

async function publishToPinterest(imageUrl: string, title: string, description: string, link?: string): Promise<string> {
  const boardId = process.env.PINTEREST_BOARD_ID;
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!boardId || !token) {
    throw new Error("Configuration Pinterest manquante (PINTEREST_BOARD_ID / PINTEREST_ACCESS_TOKEN)");
  }
  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      board_id: boardId,
      media_source: { source_type: "image_url", url: imageUrl },
      title,
      description,
      ...(link ? { link } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Erreur Pinterest API (${res.status})`);
  }
  return data.id;
}

/**
 * Publie une fiche produit sur Facebook, Instagram et Pinterest en parallèle. Chaque canal est
 * tenté indépendamment : l'échec de l'un n'empêche pas les autres. Le résultat est "réussi" dès
 * qu'au moins un canal a publié — les erreurs individuelles sont remontées pour affichage admin.
 */
export async function publishProductToSocial(input: SocialPublishInput): Promise<SocialPublishResult> {
  const caption = buildCaption(input);
  const errors: string[] = [];
  let facebookPostId: string | undefined;
  let instagramPostId: string | undefined;
  let pinterestPinId: string | undefined;

  const [fb, ig, pin] = await Promise.allSettled([
    publishToFacebookPage(input.imageUrl, caption),
    publishToInstagram(input.imageUrl, caption),
    publishToPinterest(input.imageUrl, input.name, caption, input.productUrl),
  ]);

  if (fb.status === "fulfilled") facebookPostId = fb.value;
  else errors.push(`Facebook : ${fb.reason?.message || fb.reason}`);

  if (ig.status === "fulfilled") instagramPostId = ig.value;
  else errors.push(`Instagram : ${ig.reason?.message || ig.reason}`);

  if (pin.status === "fulfilled") pinterestPinId = pin.value;
  else errors.push(`Pinterest : ${pin.reason?.message || pin.reason}`);

  return { facebookPostId, instagramPostId, pinterestPinId, errors };
}
