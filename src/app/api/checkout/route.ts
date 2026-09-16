import { NextRequest, NextResponse } from "next/server";
import { createOrder, updateOrder } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Paiement non configuré — contactez l'administrateur" }, { status: 500 });
  }

  const body = await req.json();
  const { client, email, phone, items, total, pickupDate, slot, mode, address, note } = body;

  if (!client || !email || !items?.length || !total) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  // 1. Create the order as "unpaid"
  const order = await createOrder({
    client,
    email,
    phone,
    items,
    total,
    pickupDate,
    slot,
    mode,
    address,
    note,
    status: "pending",
    paymentStatus: "unpaid",
  });

  // 2. Build Stripe session
  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const line_items = items.map((i: any) => ({
    quantity: i.quantity,
    price_data: {
      currency: "eur",
      unit_amount: Math.round((Number(i.price) || 0) * 100),
      product_data: {
        name: i.name + (i.flavor || i.size ? ` — ${[i.flavor, i.size].filter(Boolean).join(" / ")}` : ""),
      },
    },
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: email,
    payment_method_types: ["card"],
    success_url: `${origin}/merci?order=${order._id}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/commander?canceled=1`,
    metadata: { orderId: String(order._id) },
  });

  await updateOrder(order._id, { stripeSessionId: session.id });

  return NextResponse.json({ url: session.url, orderId: String(order._id) });
}
