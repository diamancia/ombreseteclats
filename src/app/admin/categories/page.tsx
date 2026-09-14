"use client";
import { useEffect, useState } from "react";
import { adminFetch, uploadImage, IMAGE_PRESETS } from "@/lib/adminClient";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    const c = await fetch("/api/categories?all=true", { cache: "no-store" }).then((r) => r.json());
    setCats(c);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cette catégorie ? Ses sous-catégories resteront mais perdront leur rattachement.")) return;
    await adminFetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  const topLevel = cats.filter((c) => !c.parent);
  const childrenOf = (parentId: string) => cats.filter((c) => c.parent === parentId);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Catégories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez des catégories principales, puis des sous-catégories rattachées à l&apos;une d&apos;elles.
          </p>
        </div>
        <button
          onClick={() => setEditing({ name: "", emoji: "", imageUrl: "", active: true, parent: "" })}
          className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)]"
        >
          <Plus className="h-4 w-4" /> Nouvelle
        </button>
      </div>

      <div className="space-y-6">
        {topLevel.map((c) => (
          <div key={c._id}>
            <CategoryRow cat={c} onEdit={() => setEditing({ ...c, parent: c.parent || "" })} onRemove={() => remove(c._id)} />
            {childrenOf(c._id).length > 0 && (
              <div className="ml-10 mt-3 space-y-3 border-l-2 border-[var(--accent)] pl-4">
                {childrenOf(c._id).map((sub) => (
                  <CategoryRow
                    key={sub._id}
                    cat={sub}
                    onEdit={() => setEditing({ ...sub, parent: sub.parent || "" })}
                    onRemove={() => remove(sub._id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {cats.length === 0 && <p className="text-gray-400">Aucune catégorie pour l&apos;instant.</p>}
      </div>

      {editing && (
        <CategoryModal
          initial={editing}
          parentOptions={topLevel.filter((c) => c._id !== editing._id)}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function CategoryRow({ cat, onEdit, onRemove }: { cat: any; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-white">
        {cat.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">{cat.emoji}</div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{cat.name}</h3>
        <p className="text-xs text-gray-500">{cat.active ? "Active" : "Inactive"}</p>
      </div>
      <button onClick={onEdit} className="text-[var(--primary)]">
        <Edit className="h-4 w-4" />
      </button>
      <button onClick={onRemove} className="text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function CategoryModal({
  initial,
  parentOptions,
  onClose,
  onSaved,
}: {
  initial: any;
  parentOptions: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, parent: form.parent || null };
      if (form._id) {
        await adminFetch(`/api/categories/${form._id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/categories", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImage(f, IMAGE_PRESETS.square);
      setForm({ ...form, imageUrl: url });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{form._id ? "Modifier" : "Nouvelle catégorie"}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Nom *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Catégorie parente</label>
            <select
              value={form.parent || ""}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="">Aucune (catégorie principale)</option>
              {parentOptions.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Image de la catégorie</label>
            <p className="mb-3 text-xs text-gray-400">Format carré recommandé — recadrée et compressée automatiquement.</p>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-white">
                {form.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-gray-300">
                    {form.emoji || "?"}
                  </div>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)] px-4 py-2 text-xs text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]">
                <Upload className="h-4 w-4" /> {uploading ? "Traitement…" : form.imageUrl ? "Changer" : "Uploader"}
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              {form.imageUrl && (
                <button type="button" onClick={() => setForm({ ...form, imageUrl: "" })} className="text-xs text-red-600 hover:underline">
                  Retirer
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Emoji (fallback uniquement si pas d&apos;image)</label>
            <input
              value={form.emoji || ""}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              placeholder="🍰"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="text-sm">Active</span>
          </label>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-sm border border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest">
            Annuler
          </button>
          <button onClick={save} disabled={saving} className="rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60">
            {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
