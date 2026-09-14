import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Order, Notification, Settings } from "@/lib/models";
import { verifyUser } from "@/lib/auth";
import { sendOwnerOrderEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const body = await req.json();
    const { client, email, items, total } = body;
    if (!client || !email || !items?.length || total === undefined || total === null) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    const o = await Order.create(body);
    // Messagerie interne — notifie les admins d'une nouvelle commande (best-effort).
    Notification.create({
      type: "order",
      title: `Nouvelle commande de ${client}`,
      body: `${total} € · ${items.length} article(s)`,
      link: "/admin/commandes",
    }).catch(() => {});
    // Copie email perso — Phase 6, en complément de la messagerie interne (best-effort).
    Settings.findOne()
      .select("email")
      .lean()
      .then((s: any) => s?.email && sendOwnerOrderEmail(s.email, { client, total, items }))
      .catch(() => {});
    return NextResponse.json(o, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyUser(req, "commandes")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const sp = req.nextUrl.searchParams;
  const page = parseInt(sp.get("page") || "1");
  const limit = parseInt(sp.get("limit") || "20");
  const filter: Record<string, any> = {};
  const status = sp.get("status");
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}
