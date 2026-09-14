import { Resend } from "resend";

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/**
 * Copie email d'une commande vers l'adresse perso du commerçant (Settings.email),
 * en complément de la messagerie interne. Best-effort : sans clé configurée ou en cas
 * d'erreur, ne fait rien — ne doit jamais bloquer la création de la commande.
 * Utilise l'expéditeur de test Resend (onboarding@resend.dev), qui n'exige pas de
 * domaine vérifié tant que le destinataire est l'adresse du compte Resend lui-même.
 */
export async function sendOwnerOrderEmail(
  to: string,
  order: { client: string; total: number; items: { name?: string; quantity?: number }[] }
) {
  const resend = getClient();
  if (!resend || !to) return;
  const itemsList = order.items.map((i) => `- ${i.name || "Article"} × ${i.quantity || 1}`).join("\n");
  await resend.emails.send({
    from: "Ombre & Éclats <onboarding@resend.dev>",
    to,
    subject: `Nouvelle commande — ${order.client}`,
    text: `Nouvelle commande de ${order.client}\nTotal : ${order.total} €\n\n${itemsList}`,
  });
}
