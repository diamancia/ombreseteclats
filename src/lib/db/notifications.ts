import { db, throwIfError } from "./client";

export type Notification = {
  _id: string;
  type: "order" | "system";
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

function fromDbNotification(row: any): Notification {
  return {
    _id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createNotification(patch: { type?: string; title: string; body?: string; link?: string }): Promise<Notification> {
  const row = throwIfError(await db().from("notifications").insert(patch).select("*").single());
  return fromDbNotification(row);
}

export async function listNotifications(limit = 50): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const [{ data, error }, { count, error: countError }] = await Promise.all([
    db().from("notifications").select("*").order("created_at", { ascending: false }).limit(limit),
    db().from("notifications").select("*", { count: "exact", head: true }).eq("read", false),
  ]);
  if (error) throw error;
  if (countError) throw countError;
  return { notifications: (data || []).map(fromDbNotification), unreadCount: count || 0 };
}

export async function updateNotification(id: string, patch: { read?: boolean }): Promise<Notification> {
  const row = throwIfError(await db().from("notifications").update(patch).eq("id", id).select("*").single());
  return fromDbNotification(row);
}

export async function markAllNotificationsRead(): Promise<void> {
  throwIfError(await db().from("notifications").update({ read: true }).eq("read", false));
}
