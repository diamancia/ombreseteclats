"use client";
import { MetalType, GoldColor } from "@/lib/metals";

export type StoneAttrs = {
  nature?: "naturelle" | "synthetique" | "diamant" | "";
  shape?: string;
  carats?: number;
  centralDescription?: string;
  secondaryDescription?: string;
};

export type ProductAttrs = {
  jewelryType?: string;
  dimensionValue?: string;
  stone?: StoneAttrs | null;
  metal?: string;
  goldColor?: string;
  metalCustom?: string;
};

const JEWELRY_TYPES: { value: string; label: string }[] = [
  { value: "bague", label: "Bague" },
  { value: "bracelet", label: "Bracelet" },
  { value: "collier", label: "Collier" },
  { value: "gourmette_cheville", label: "Gourmette cheville" },
  { value: "boucle_oreille", label: "Boucle d'oreille" },
  { value: "ceinture_traditionnelle", label: "Ceinture traditionnelle" },
  { value: "broche", label: "Broche" },
  { value: "perles", label: "Perles" },
  { value: "cordon", label: "Cordon" },
];

const DIMENSION_LABEL: Record<string, string> = {
  bague: "Taille (mm)",
  bracelet: "Tour de poignet (cm)",
  collier: "Tour de cou (cm)",
  gourmette_cheville: "Tour de cheville (cm)",
  ceinture_traditionnelle: "Tour de taille (cm)",
  perles: "Longueur du rang (cm)",
  cordon: "Longueur (cm)",
};

const STONE_NATURES: { value: StoneAttrs["nature"]; label: string }[] = [
  { value: "naturelle", label: "Naturelle" },
  { value: "synthetique", label: "Synthétique" },
  { value: "diamant", label: "Diamant" },
];

const STONE_SHAPES = [
  "rond",
  "ovale",
  "princesse",
  "coeur",
  "emeraude",
  "poire",
  "marquise",
  "coussin",
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-[var(--primary)] text-[var(--background)]"
          : "border border-gray-300 text-gray-600 hover:border-[var(--primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProductAttributesFields({
  value,
  onChange,
  metalTypes = [],
  goldColors = [],
}: {
  value: ProductAttrs;
  onChange: (patch: Partial<ProductAttrs>) => void;
  metalTypes?: MetalType[];
  goldColors?: GoldColor[];
}) {
  const stone = value.stone || null;
  const dimensionLabel = value.jewelryType ? DIMENSION_LABEL[value.jewelryType] : undefined;

  function updateStone(patch: Partial<StoneAttrs>) {
    onChange({ stone: { ...(stone || {}), ...patch } });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
          Type de bijou
        </label>
        <div className="flex flex-wrap gap-2">
          {JEWELRY_TYPES.map((t) => (
            <Chip
              key={t.value}
              active={value.jewelryType === t.value}
              onClick={() => onChange({ jewelryType: t.value })}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      {metalTypes.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Métal</label>
          <div className="flex flex-wrap gap-2">
            {metalTypes.map((m) => (
              <Chip
                key={m.key}
                active={value.metal === m.key}
                onClick={() => onChange({ metal: m.key, goldColor: m.key === "or" ? value.goldColor : undefined })}
              >
                {m.label}
              </Chip>
            ))}
          </div>
          {value.metal === "or" && goldColors.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              {goldColors.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  title={c.label}
                  aria-label={c.label}
                  onClick={() => onChange({ goldColor: c.key })}
                  className={`h-7 w-7 rounded-full ring-2 transition-transform ${
                    value.goldColor === c.key ? "scale-110 ring-[var(--primary)]" : "ring-transparent hover:ring-gray-300"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
          <input
            value={value.metalCustom || ""}
            onChange={(e) => onChange({ metalCustom: e.target.value })}
            placeholder="Précision libre (optionnel) — ex. Or 21 carats, Titane…"
            className="mt-3 w-full max-w-xs rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
      )}

      {dimensionLabel && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
            {dimensionLabel}
          </label>
          <input
            value={value.dimensionValue || ""}
            onChange={(e) => onChange({ dimensionValue: e.target.value })}
            className="w-full max-w-[200px] rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!stone}
            onChange={(e) => onChange({ stone: e.target.checked ? {} : null })}
          />
          <span className="text-sm">Cette pièce comporte une pierre</span>
        </label>
      </div>

      {stone && (
        <div className="space-y-4 rounded-xl border border-gray-200 p-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Nature de la pierre
            </label>
            <div className="flex flex-wrap gap-2">
              {STONE_NATURES.map((n) => (
                <Chip
                  key={n.value}
                  active={stone.nature === n.value}
                  onClick={() => updateStone({ nature: n.value })}
                >
                  {n.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Forme
            </label>
            <div className="flex flex-wrap gap-2">
              {STONE_SHAPES.map((s) => (
                <Chip key={s} active={stone.shape === s} onClick={() => updateStone({ shape: s })}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                Carats
              </label>
              <input
                type="number"
                step="0.01"
                value={stone.carats ?? ""}
                onChange={(e) => updateStone({ carats: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Pierre centrale
            </label>
            <input
              placeholder="ex. Diamant rond 0.50 ct"
              value={stone.centralDescription || ""}
              onChange={(e) => updateStone({ centralDescription: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Pierres secondaires
            </label>
            <input
              placeholder="ex. 6 diamants ronds 0.05 ct (pavage)"
              value={stone.secondaryDescription || ""}
              onChange={(e) => updateStone({ secondaryDescription: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
