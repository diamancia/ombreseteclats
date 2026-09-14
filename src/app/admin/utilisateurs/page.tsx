"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminClient";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { PERMISSIONS, PermissionKey, ROLES, ROLE_PRESETS, UserRole } from "@/lib/modules";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  modules: PermissionKey[];
  active: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const u = await adminFetch("/api/users");
      setUsers(u);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await adminFetch(`/api/users/${id}`, { method: "DELETE" });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez des accès pour votre équipe — vous choisissez leur identifiant, leur mot de passe et les écrans auxquels ils ont accès.
          </p>
        </div>
        <button
          onClick={() => setEditing({ name: "", email: "", password: "", role: "custom", modules: [], active: true })}
          className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)]"
        >
          <Plus className="h-4 w-4" /> Nouvel utilisateur
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3">Nom</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rôle</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">{ROLES.find((r) => r.key === u.role)?.label || u.role}</td>
                <td className="px-6 py-4">
                  <span className={u.active ? "text-green-600" : "text-gray-400"}>{u.active ? "Actif" : "Désactivé"}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditing({ ...u, password: "" })} className="text-[var(--primary)]">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(u._id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Aucun utilisateur pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <UserModal initial={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}

function UserModal({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setRole(role: UserRole) {
    setForm({ ...form, role, modules: ROLE_PRESETS[role] });
  }

  function toggleModule(key: PermissionKey) {
    const has = form.modules?.includes(key);
    setForm({
      ...form,
      modules: has ? form.modules.filter((m: string) => m !== key) : [...(form.modules || []), key],
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (form._id) {
        await adminFetch(`/api/users/${form._id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/users", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{form._id ? "Modifier" : "Nouvel utilisateur"}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Nom *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Email *</label>
            <input
              type="email"
              value={form.email}
              disabled={!!form._id}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Mot de passe {form._id ? <span className="normal-case font-normal text-gray-400">(laisser vide pour ne pas changer)</span> : "*"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Rôle</label>
            <p className="mb-2 text-xs text-gray-400">Préréglage de départ — les accès restent modifiables ci-dessous.</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    form.role === r.key
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--background)]"
                      : "border-gray-200 text-gray-600 hover:border-[var(--primary)]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Accès aux écrans</label>
            <div className="space-y-2">
              {PERMISSIONS.map((p) => (
                <label key={p.key} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form.modules?.includes(p.key)} onChange={() => toggleModule(p.key)} />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="text-sm">Compte actif</span>
          </label>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-sm border border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest">
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60"
          >
            {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
