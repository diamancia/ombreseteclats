"use client";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

// Section repliable du footer, réutilisée pour les 3 rubriques principales (Navigation,
// Informations légales, Contact) et pour le sous-accordéon "Collections" imbriqué dans
// Navigation (`level={1}`), qui s'ouvre/se ferme indépendamment du reste.
//
// Animation en pur CSS (grid-template-rows 0fr -> 1fr), pas de mesure de hauteur en JS : le
// contenu réel peut donc changer (photos produit, liens dynamiques) sans jamais rejouer un
// calcul. `motion-reduce:transition-none` respecte prefers-reduced-motion.
export default function FooterAccordionItem({
  title,
  defaultOpen = false,
  level = 0,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  level?: 0 | 1;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={level === 0 ? "border-b border-[var(--accent)]" : ""}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex min-h-11 w-full items-center justify-between gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          level === 0
            ? "py-3 font-serif text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--foreground)]"
            : "py-2 text-[13px] text-[var(--foreground)]/85"
        }`}
      >
        {title}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 flex-shrink-0 text-[var(--ink-faint)] transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className={level === 0 ? "pb-3" : "pb-2 pl-3"}>{children}</div>
        </div>
      </div>
    </div>
  );
}
