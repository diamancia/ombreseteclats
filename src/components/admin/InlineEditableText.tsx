"use client";
import { useState, ElementType } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useEditMode } from "./EditMode";
import { adminFetch } from "@/lib/adminClient";

export default function InlineEditableText({
  field,
  value,
  as: Tag = "div",
  className = "",
  multiline = false,
}: {
  field: string;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
}) {
  const editMode = useEditMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  if (!editMode) {
    const Plain = Tag as any;
    return <Plain className={className}>{value}</Plain>;
  }

  if (!editing) {
    const Editable = Tag as any;
    return (
      <Editable
        className={`${className} group cursor-pointer rounded ring-1 ring-dashed ring-[#6c5ce7]/40 transition-colors hover:ring-2 hover:ring-[#6c5ce7]`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Cliquer pour modifier"
      >
        {value}
        <Pencil className="ml-2 inline-block h-3.5 w-3.5 align-middle text-[#6c5ce7] opacity-0 group-hover:opacity-100" />
      </Editable>
    );
  }

  async function save() {
    setSaving(true);
    try {
      const current = await fetch("/api/settings").then((r) => r.json());
      await adminFetch("/api/settings", { method: "PUT", body: JSON.stringify({ ...current, [field]: draft }) });
      window.location.reload();
    } catch {
      alert("Erreur : impossible d'enregistrer");
      setSaving(false);
    }
  }

  return (
    <div className={className}>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          autoFocus
          className="w-full rounded-lg border-2 border-[#6c5ce7] bg-white p-2 text-sm text-gray-900"
        />
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="w-full rounded-lg border-2 border-[#6c5ce7] bg-white p-2 text-sm text-gray-900"
        />
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1 rounded-full bg-[#6c5ce7] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
        >
          <Check className="h-3 w-3" /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
        >
          <X className="h-3 w-3" /> Annuler
        </button>
      </div>
    </div>
  );
}
