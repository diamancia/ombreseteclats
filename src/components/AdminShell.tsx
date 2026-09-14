"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Tag, ClipboardList, Settings as SettingsIcon, LogOut, Home, Users, Bell } from "lucide-react";
import { siteConfig } from "@/site.config";
import { TOKEN_KEY, USER_KEY } from "@/lib/storage";
import { PermissionKey } from "@/lib/modules";

const nav: { href: string; label: string; icon: any; perm?: PermissionKey }[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package, perm: "produits" },
  { href: "/admin/categories", label: "Catégories", icon: Tag, perm: "categories" },
  { href: "/admin/commandes", label: "Commandes", icon: ClipboardList, perm: "commandes" },
  { href: "/admin/notifications", label: "Messagerie", icon: Bell },
  { href: "/admin/parametres", label: "Paramètres", icon: SettingsIcon, perm: "parametres" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, perm: "utilisateurs" },
];

type StoredUser = { name?: string; role?: string; modules?: PermissionKey[] };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    try {
      setUser(JSON.parse(localStorage.getItem(USER_KEY) || "{}"));
    } catch {
      setUser({});
    }
    setChecking(false);
  }, [pathname, router]);

  useEffect(() => {
    if (checking) return;
    fetch("/api/notifications", { headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUnread(d.unread))
      .catch(() => {});
  }, [checking, pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (checking) return <div className="flex min-h-screen items-center justify-center">Chargement…</div>;

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    router.push("/admin/login");
  }

  const visibleNav = nav.filter((n) => {
    if (!n.perm) return true;
    if (user?.role === "admin") return true;
    return user?.modules?.includes(n.perm);
  });

  return (
    <div
      className="flex min-h-screen"
      style={{
        "--background": "#ffffff",
        "--foreground": "#1a1a2e",
        "--primary": "#6c5ce7",
        "--primary-dark": "#5a4bd1",
        "--accent": "#f0f0f5",
        "--muted": "#f7f7fa",
      } as React.CSSProperties}
    >
      <aside className="w-64 border-r border-gray-200 bg-[#1a1a2e]">
        <div className="border-b border-white/10 p-6">
          <Link href="/admin" className="font-serif text-2xl text-white">
            {siteConfig.brand.name} <span className="text-[#a29bfe]">Admin</span>
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {visibleNav.map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#6c5ce7] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
                {n.href === "/admin/notifications" && unread > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white">
            <Home className="h-4 w-4" /> Voir le site
          </Link>
          <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-900/20">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[var(--muted)] p-10 text-[var(--foreground)]">{children}</main>
    </div>
  );
}

export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}
