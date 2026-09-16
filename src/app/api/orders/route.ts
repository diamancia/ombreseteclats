import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders, createNotification } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import { sendTelegramMessage, formatOrderTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client, email, phone, items, total } = body;
    if (!client || !email || !items?.length || total === undefined || total === null) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    const o = await createOrder(body);
    // Messagerie interne — notifie les admins d'une nouvelle commande (best-effort).
    createNotification({
      type: "order",
      title: `Nouvelle commande de ${client}`,
      body: `${total} € · ${items.length} article(s)`,
      link: "/admin/commandes",
    }).catch(() => {});
    // Notification Telegram — instantanée sur le téléphone, sans dépendre de l'email (best-effort).
    sendTelegramMessage(formatOrderTelegramMessage({ client, phone, total, items })).catch(() => {});
    return NextResponse.json(o, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyUser(req, "commandes")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const page = parseInt(sp.get("page") || "1");
  const limit = parseInt(sp.get("limit") || "20");
  const status = sp.get("status") || undefined;

  const { orders, total } = await listOrders({ status, page, limit });
  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}
