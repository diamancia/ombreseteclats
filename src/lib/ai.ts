import Anthropic from "@anthropic-ai/sdk";

export type AiDescription = {
  shortDesc: string;
  longDesc: string;
  hashtags: string[];
};

async function fetchImageAsBase64(url: string): Promise<{ data: string; mediaType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Impossible de récupérer l'image (${res.status})`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return { data: buf.toString("base64"), mediaType: contentType };
}

export async function generateProductDescription(
  imageUrl: string,
  context: { jewelryType?: string; stoneDescription?: string } = {}
): Promise<AiDescription> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY env variable");
  }

  const client = new Anthropic();
  const { data, mediaType } = await fetchImageAsBase64(imageUrl);

  const contextLines = [
    context.jewelryType ? `Type de bijou indiqué par l'admin : ${context.jewelryType}.` : null,
    context.stoneDescription ? `Pierre : ${context.stoneDescription}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data,
            },
          },
          {
            type: "text",
            text: `Tu es rédacteur pour "Ombre & Éclats", une bijouterie d'homme haut de gamme en argent massif 925 (ton sobre, affirmé, discret — jamais tape-à-l'œil). ${contextLines}
Analyse la photo et réponds UNIQUEMENT en JSON valide, sans texte autour, avec ce format exact :
{"shortDesc": "une phrase courte et vendeuse (max 100 caractères)", "longDesc": "description complète en 2-3 phrases, dans le ton de la marque", "hashtags": ["#exemple1", "#exemple2"]}
Génère 6 à 10 hashtags pertinents pour Instagram/Facebook (en français, mélange marque/produit/style).`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse IA invalide (aucun texte)");
  }

  try {
    const parsed = JSON.parse(textBlock.text);
    return {
      shortDesc: String(parsed.shortDesc || ""),
      longDesc: String(parsed.longDesc || ""),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
    };
  } catch {
    throw new Error("Réponse IA invalide (JSON non parsable)");
  }
}
