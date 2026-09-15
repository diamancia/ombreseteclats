import { db, throwIfError } from "./client";

export type OrderItem = { productId: string; name: string; flavor?: string; size?: string; quantity: number; price: number };

export type Order = {
  _id: string;
  client: string;
  email: string;
  phone?: string | null;
  items: OrderItem[];
  total: number;
  pickupDate?: string | null;
  slot?: string | null;
  mode: "pickup" | "delivery";
  address?: string | null;
  note?: string | null;
  attachmentUrl?: string | null;
  status: "pending" | "confirmed" | "ready" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded" | "failed";
  stripeSessionId?: string | null;
  stripePaymentIntent?: string | null;
  createdAt: string;
  updatedAt: string;
};

function fromDbOrder(row: any): Order {
  return {
    _id: row.id,
    client: row.client,
    email: row.email,
    phone: row.phone,
    items: row.items || [],
    total: Number(row.total),
    pickupDate: row.pickup_date,
    slot: row.slot,
    mode: row.mode,
    address: row.address,
    note: row.note,
    attachmentUrl: row.attachment_url,
    status: row.status,
    paymentStatus: row.payment_status,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntent: row.stripe_payment_intent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FIELD_MAP: Record<string, string> = {
  pickupDate: "pickup_date",
  attachmentUrl: "attachment_url",
  paymentStatus: "payment_status",
  stripeSessionId: "stripe_session_id",
  stripePaymentIntent: "stripe_payment_intent",
};
function toDbOrder(patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

export async function createOrder(patch: Record<string, any>): Promise<Order> {
  const row = throwIfError(await db().from("orders").insert(toDbOrder(patch)).select("*").single());
  return fromDbOrder(row);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromDbOrder(data) : null;
}

export async function updateOrder(id: string, patch: Record<string, any>): Promise<Order> {
  const row = throwIfError(await db().from("orders").update(toDbOrder(patch)).eq("id", id).select("*").single());
  return fromDbOrder(row);
}

export async function listOrders(opts: { status?: string; page?: number; limit?: number } = {}): Promise<{
  orders: Order[];
  total: number;
}> {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  let q = db().from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  q = q.range((page - 1) * limit, page * limit - 1);
  const { data, error, count } = await q;
  if (error) throw error;
  return { orders: (data || []).map(fromDbOrder), total: count || 0 };
}

export async function countOrders(): Promise<number> {
  const { count, error } = await db().from("orders").select("*", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

export async function bulkInsertOrders(items: Record<string, any>[]): Promise<Order[]> {
  const rows = throwIfError(await db().from("orders").insert(items.map(toDbOrder)).select("*"));
  return (rows || []).map(fromDbOrder);
}
