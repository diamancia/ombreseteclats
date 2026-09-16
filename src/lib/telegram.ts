// Notification instantanée sur Telegram — remplace l'email (peu utilisé par la clientèle
// marocaine) comme canal de notification "hors admin" pour les nouvelles commandes/demandes.
// Best-effort : n'importe quelle erreur réseau/config est avalée par l'appelant, jamais
// bloquante pour la création de la commande elle-même.

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export function formatOrderTelegramMessage(order: {
  client: string;
  phone?: string;
  total: number;
  items: { name: string; quantity: number }[];
}) {
  const isCustom = order.items.length === 1 && order.items[0].name.startsWith("Sur-mesure");
  const lines = [
    isCustom ? "✂️ <b>Nouvelle demande sur-mesure</b>" : "🔔 <b>Nouvelle commande</b>",
    `👤 ${order.client}${order.phone ? ` · ${order.phone}` : ""}`,
  ];
  if (!isCustom) {
    lines.push(`💰 ${order.total.toFixed(2)} € · ${order.items.length} article(s)`);
    for (const it of order.items) lines.push(`  • ${it.quantity}× ${it.name}`);
  } else {
    lines.push(order.items[0].name);
  }
  return lines.join("\n");
}
