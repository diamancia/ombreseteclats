"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminClient";
import { ShoppingBag, Bell, CheckCheck } from "lucide-react";

type Notif = {
  _id: string;
  type: "order" | "system";
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const d = await adminFetch("/api/notifications");
      setNotifs(d.notifications);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function open(n: Notif) {
    if (!n.read) {
      await adminFetch(`/api/notifications/${n._id}`, { method: "PUT", body: JSON.stringify({ read: true }) });
      setNotifs((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    }
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    await adminFetch("/api/notifications/read-all", { method: "POST" });
    setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
  }

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Messagerie</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-sm border border-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
          >
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading && <p className="text-gray-400">Chargement…</p>}

      {!loading && notifs.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          Aucune notification pour l&apos;instant.
        </div>
      )}

      <div className="space-y-2">
        {notifs.map((n) => (
          <button
            key={n._id}
            onClick={() => open(n)}
            className={`flex w-full items-start gap-4 rounded-2xl p-5 text-left shadow-sm transition-colors ${
              n.read ? "bg-white" : "bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/20"
            }`}
          >
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--primary)]">
              {n.type === "order" ? <ShoppingBag className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm ${n.read ? "font-medium text-gray-700" : "font-semibold"}`}>{n.title}</p>
                {!n.read && <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
              </div>
              {n.body && <p className="mt-1 text-xs text-gray-500">{n.body}</p>}
              <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-400">
                {new Date(n.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
